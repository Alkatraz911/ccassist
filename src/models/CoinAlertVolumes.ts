import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CoinAlertVolumes {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  market: string;
  @Column()
  pair: string;
  @Column()
  vol: string;
  @Column({type: "float", nullable: true})
  vol_change_24:  number;
  @Column()
  last:  string;
  @Column()
  date:  string;
  
}