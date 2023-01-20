import { ApiProperty } from "@nestjs/swagger";

export class UpdateCategoryDto {
    @ApiProperty({ example: '1', description: 'Unique identifier' })
    readonly id: number;

    @ApiProperty({ example: 'food', description: 'The category name' })
    readonly name: string;
}