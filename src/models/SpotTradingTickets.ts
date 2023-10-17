import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SpotTradingTickets {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  symbol: string;
}