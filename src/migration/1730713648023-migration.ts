import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730713648023 implements MigrationInterface {
    name = 'Migration1730713648023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` ADD \`course_id\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_8510ab448f65396f69cc54c858c\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_8510ab448f65396f69cc54c858c\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`course_id\``);
    }
}
