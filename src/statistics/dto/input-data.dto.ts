import { ApiProperty } from "@nestjs/swagger";

export class InputDataDto {
    @ApiProperty({ example: [1, 3], description: 'A list of categories by wich to calculate statistics' })
    readonly categories: number[];

    @ApiProperty({ example: '01/01/2023', description: 'Start of the period' })
    readonly fromDate: string;

    @ApiProperty({ example: '20/02/2023', description: 'End of the period' })
    readonly toDate: string;
}