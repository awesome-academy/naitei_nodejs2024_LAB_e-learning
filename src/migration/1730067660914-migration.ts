import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1730067660914 implements MigrationInterface {
    name = 'Migration1730067660914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`carts\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` bigint NULL, \`courseId\` bigint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone_number\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone_number\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`gender\` \`gender\` enum ('male', 'female', 'other') NOT NULL DEFAULT 'male'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`address\` \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identity_card\` \`identity_card\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP COLUMN \`average_rating\``);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD \`average_rating\` float NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`enrollments\` CHANGE \`completion_date\` \`completion_date\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD CONSTRAINT \`FK_69828a178f152f157dcf2f70a89\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD CONSTRAINT \`FK_912fce0a7009dd3b515464fed20\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_912fce0a7009dd3b515464fed20\``);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_69828a178f152f157dcf2f70a89\``);
        await queryRunner.query(`ALTER TABLE \`enrollments\` CHANGE \`completion_date\` \`completion_date\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP COLUMN \`average_rating\``);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD \`average_rating\` decimal(3,2) NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identity_card\` \`identity_card\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`address\` \`address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`gender\` \`gender\` enum ('male', 'female', 'other') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone_number\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone_number\` int NOT NULL`);
        await queryRunner.query(`DROP TABLE \`carts\``);
    }

}
