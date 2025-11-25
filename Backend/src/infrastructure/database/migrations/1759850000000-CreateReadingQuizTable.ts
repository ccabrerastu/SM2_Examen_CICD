import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateReadingQuizTable1759850000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reading_quizzes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reading_content_id',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'total_questions',
            type: 'int',
            default: 0,
          },
          {
            name: 'passing_score',
            type: 'int',
            default: 0,
          },
          {
            name: 'questions',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'time_limit',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'reading_quizzes',
      new TableForeignKey({
        columnNames: ['reading_content_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'reading_contents',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('reading_quizzes');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('reading_content_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('reading_quizzes', foreignKey);
      }
    }
    await queryRunner.dropTable('reading_quizzes');
  }
}
