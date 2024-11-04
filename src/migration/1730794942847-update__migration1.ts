import { MigrationInterface, QueryRunner } from "typeorm";

export class Update_migration11730794942847 implements MigrationInterface {
    name = 'Update_migration11730794942847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_8510ab448f65396f69cc54c858c\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_8510ab448f65396f69cc54c858c\``);
    }

}
