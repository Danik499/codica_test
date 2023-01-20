import { ApiProperty } from "@nestjs/swagger";

export type TransactionCategory = {
    name: string,
    amount: number
}

export enum TransactionTypes {
    profitable = 'profitable',
    consumable = 'consumable'
}

export class CreateTransactionDto {
    @ApiProperty({ example: '1', description: 'The bank id' })
    readonly bank: number;

    @ApiProperty({ example: 'consumable', description: 'The transaction type (profitable | consumable)' })
    readonly type: TransactionTypes;

    @ApiProperty({ example: 'https://some.domain/example', description: 'URL where to send updates' })
    readonly webhook: string;

    @ApiProperty({ example: [{name: 'food', amount: 430 }, { name: 'drinks', amount: 240 }], description: 'The transaction categories' })
    readonly categories: Array<TransactionCategory>
}