import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMigrationProfessor1729743582314 implements MigrationInterface {
    name = 'UpdateMigrationProfessor1729743582314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`department\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`years_of_experience\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`gender\` \`gender\` enum ('male', 'female', 'other') NOT NULL DEFAULT 'male'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`address\` \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identity_card\` \`identity_card\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identity_card\` \`identity_card\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`address\` \`address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`gender\` \`gender\` enum ('male', 'female', 'other') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`years_of_experience\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`department\``);
    }

}
