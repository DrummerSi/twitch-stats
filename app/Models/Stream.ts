import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Streamer from './Streamer'
import Viewer from './Viewer'

export default class Stream extends BaseModel {
    @column({ isPrimary: true })
    public id: number
    
    @column()
    public streamerId: number

    @column()
    public gameName: string

    @column()
    public title: string
    
    @column()
    public thumbnail: string
    
    @column()
    public viewerCount: number
    
    @column()
    public dataTime: DateTime

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
    
    @hasOne(() => Streamer)
    public streamer: HasOne<typeof Streamer>
    
    @manyToMany(() => Viewer)
    public viewers: ManyToMany<typeof Viewer>
}
