import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductOrmEntity } from 'src/modules/products/infrastructure/persistence/typeorm/schema/product.orm-entity';
import { CustomerOrmEntity } from 'src/modules/customers/infrastructure/persistence/typeorm/schema/customer.orm-entity';
import { DeliveryOrmEntity } from 'src/modules/delivery/infrastructure/persistence/typeorm/schema/delivery.orm-entity';
import { TransactionStatus } from '../../../../domain/entities/transaction-status.vo';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey!: string;

  @Column({ unique: true })
  reference!: string;

  @Column({ name: 'gateway_id', type: 'varchar', nullable: true })
  gatewayId!: string | null;

  @Column({ type: 'varchar' })
  status!: TransactionStatus;

  @Column({ name: 'amount_in_cents', type: 'int' })
  amountInCents!: number;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductOrmEntity;

  @ManyToOne(() => CustomerOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerOrmEntity;

  @ManyToOne(() => DeliveryOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'delivery_id' })
  delivery!: DeliveryOrmEntity;

  @Column({ name: 'card_last_four', type: 'varchar', nullable: true })
  cardLastFour!: string | null;

  @Column({ name: 'card_brand', type: 'varchar', nullable: true })
  cardBrand!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
