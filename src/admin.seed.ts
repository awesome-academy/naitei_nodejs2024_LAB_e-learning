import { User } from './entity/User';
import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

export async function runSeeder(AppDataSource: DataSource) {
  const userRepository = AppDataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({ where: { email: 'admin1@example.com' } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    const adminData: Partial<User> = {
      name: 'Admin',
      email: 'admin1@example.com',
      password: hashedPassword,
      role: 'admin',
      phone_number: '911045805',
      avatar: '',
      date_of_birth: new Date('2003-02-09'),
      gender: 'male',
      address: 'Quận 9',
      identity_card: '123456789',
      additional_info: '',
    };

    await userRepository.save(adminData);
    console.log('Admin account created.');
  } else {
    console.log('Admin account already exists.');
  }
}
