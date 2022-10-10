// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


import { ClientCredentialsAuthProvider } from "@twurple/auth"
import { HelixStream } from "@twurple/api"

import Env from "@ioc:Adonis/Core/Env"
import { ApiClient } from "@twurple/api"
import now from "performance-now"

import Streamer from "App/Models/Streamer"
import Stream from "App/Models/Stream"
import Viewer from "App/Models/Viewer"
import { DateTime } from "luxon"

export default class ProcessesController {
    
    
    private apiClient: ApiClient
    
    public async index(){
        
        console.log("Init process...")

        const STREAMS = Env.get("STREAMER_LIST").split(",").map(s => s.trim())
        console.log(STREAMS)
        //const API_URL = Env.get("API_URL")
        
        const authProvider = this.getAuthProvider()
        this.apiClient = new ApiClient({ authProvider })
        
        console.log(this.apiClient)
        
        const streamData = await this.isStreamLive("rayforrachel")
        console.log("1.")
        if(streamData){
            console.log(streamData.title)
        }
        
        const allStreams = STREAMS.map(async (username: string) => {
            
            const streamData = await this.isStreamLive(username)
                if(streamData){
                console.log(`${username} IS LIVE`)
                
                const start = now()
                
                const streamer = await await Streamer.firstOrCreate({name: username}, {name: username})
                const stream = await this.createStream(streamer, streamData)
                console.log(` >> Created stream '${stream.title}' with ${stream.viewerCount} viewers`)
                
                await this.storeUsers(streamer, stream)
                
                const end = now()
                console.log(`    >> COMPLETE: ${(end-start).toFixed(2)} ms`)
                console.log("")
                
            } else {
                console.log(`${username} is not live`)
            }
            
        })
        
        await Promise.all(allStreams)
        
        console.log(" __ PROCESS COMPLETE __")
        
        // await STREAMS.forEach(async (username: string) => {
            
        //     const streamData = await this.isStreamLive(username)
        //     if(streamData){
        //         console.log(`${username} IS LIVE`)
                
        //         const start = now()
                
        //         const streamer = await await Streamer.firstOrCreate({name: username}, {name: username})
        //         const stream = await this.createStream(streamer, streamData)
        //         console.log(` >> Created stream '${stream.title}' with ${stream.viewerCount} viewers`)
                
        //         await this.storeUsers(streamer, stream)
                
        //         const end = now()
        //         console.log(`    >> COMPLETE: ${(end-start).toFixed(2)} ms`)
        //         console.log("")
                
        //     } else {
        //         console.log(`${username} is not live`)
        //     }
            
        //     console.log(" __ PROCESS COMPLETE __")
            
        // });
        
        return "Operation complete 123"
        
        
    }
    
    private async storeUsers(streamer: Streamer, stream: Stream){
        
        //Grab a list of chatters
        const data = await this.apiClient.callApi({
            url: `https://tmi.twitch.tv/group/user/${streamer.name}/chatters`,
            method: "GET",
            type: "custom"
        }) as any
        
        //Collate all viewers and mods
        const allChatters = [...data.chatters.viewers, ...data.chatters.moderators] as string[];
        
        let usersToStore = await Promise.all(allChatters.map(async(chatter) => {
            return await Viewer.firstOrCreate({name: chatter}, {name: chatter})
        }));
        
        console.log(`Saved ${usersToStore.length} viewers`)
        await stream.related("viewers").sync(usersToStore.map(u => u.id))
        
    }

    private async createStream(streamer: Streamer, streamData: HelixStream){
        
        const { gameName, title, viewers, thumbnailUrl } = streamData
        
        const stream = await Stream.create({
            streamerId: streamer.id,
            gameName,
            title,
            viewerCount: viewers,
            dataTime: this.roundDateToNearest30(),
            thumbnail: thumbnailUrl            
        })
        return stream
        
    }
    
    private roundDateToNearest30(date = new Date()){
        const minutes = 30;
        const ms = 1000 * 60 * minutes
        
        return DateTime.fromJSDate(new Date(Math.round(date.getTime() / ms) * ms))
    }
    
    
    
    
    public async test(){
        
        // const stream = await Stream.findByOrFail("id", 1)
        
        // let users = [] as any[]
        // const user1 = await Viewer.firstOrCreate({name: "drummer_si1"}, {name: "drummer_si1"})
        // users.push(user1.id)
        // const user2 = await Viewer.firstOrCreate({name: "drummer_si2"}, {name: "drummer_si2"})
        // users.push(user2.id)
        
        // await stream.related("viewers").attach(users)    
        
        return "Access denied"
        
        await Streamer.create({
            name: (Math.random() + 1).toString(36).substring(7)
        })
        
        //Create streamer
        // const streamer = await Streamer.create({
        //     name: "Simon"
        // })
        // console.log(`Created streamer: ${streamer.id}`)
        
        //Create stream
        // const streamer = await Streamer.findBy("name", "Simon")
        // const stream = await Stream.create({
        //     streamerId: streamer?.id,
        //     gameName: "Test Game",
        //     title: "LOL!",
        //     thumbnail: "whatever",
        //     viewerCount: 999,
        //     dataTime: DateTime.fromISO("2022-10-09T16:00:00")
        // })
        
        
    }
    
    
    private getAuthProvider(): ClientCredentialsAuthProvider {
        const CLIENT_ID = Env.get("CLIENT_ID")
        const CLIENT_SECRET = Env.get("CLIENT_SECRET")
        
        const authProvider = new ClientCredentialsAuthProvider(CLIENT_ID, CLIENT_SECRET)
        return authProvider
    }
             
    private async isStreamLive(name: string){
        const user = await this.apiClient.users.getUserByName(name)
        if(!user) return false
        const stream = await user.getStream()
        
        return (stream !== null ? stream : false)
    }                       

    
}
