import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer("streamer_id")
        .unsigned()
        .references("id")
        .inTable("streamers")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
      
      table.string("game_name")
      table.string("title")
      table.string("thumbnail")
      table.integer("viewer_count")
      table.dateTime("data_time")
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
