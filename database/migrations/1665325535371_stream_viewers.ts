
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'stream_viewer'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer("stream_id")
        .unsigned()
        .references("id")
        .inTable("streams")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
      
      table.integer("viewer_id")
        .unsigned()
        .references("id")
        .inTable("viewers")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
        
      table.timestamp('created_at', { useTz: true }) //.defaultTo(Date())
      table.timestamp('updated_at', { useTz: true }) //.defaultTo(Date())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
