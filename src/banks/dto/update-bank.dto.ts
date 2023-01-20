import { ApiProperty } from "@nestjs/swagger";

export class UpdateBankDto {
    @ApiProperty({ example: '1', description: 'Unique identifier' })
    readonly id: number;

    @ApiProperty({ example: 'Privat', description: 'The bank name' })
    readonly name: string;
}