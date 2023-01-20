import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
    @ApiProperty({ example: 'food', description: 'The category name' })
    readonly name: string;
}