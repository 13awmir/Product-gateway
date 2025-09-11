import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'tokens' })
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'bigint' })
  expiresAt: number;
}
