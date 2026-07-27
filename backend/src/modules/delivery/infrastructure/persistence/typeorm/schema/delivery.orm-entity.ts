import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerOrmEntity } from 'src/modules/customers/infrastructure/persistence/typeorm/schema/customer.orm-entity';

@Entity('deliveries')
export class DeliveryOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column()
  country!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.deliveries, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerOrmEntity;
}
