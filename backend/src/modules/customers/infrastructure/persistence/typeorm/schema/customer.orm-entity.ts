import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryOrmEntity } from '../../../../../delivery/infrastructure/persistence/typeorm/schema/delivery.orm-entity';

@Entity('customers')
export class CustomerOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', unique: true })
  phone!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => DeliveryOrmEntity, (delivery) => delivery.customer)
  deliveries!: DeliveryOrmEntity[];
}
