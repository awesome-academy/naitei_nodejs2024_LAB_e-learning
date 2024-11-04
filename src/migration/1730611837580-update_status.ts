import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStatus1730611837580 implements MigrationInterface {
    name = 'UpdateStatus1730611837580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`courses\` ADD \`status\` enum ('draft', 'public') NOT NULL DEFAULT 'draft'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`courses\` DROP COLUMN \`status\``);
    }
}
