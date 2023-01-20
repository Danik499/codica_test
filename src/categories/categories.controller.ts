import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger/dist/decorators';
import { Category } from './categories.model';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('api/category')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    private checkId(id) {
        return id == parseInt(id) && id > 0;
    }
    
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({ status: 200, type: [Category] })
    @Get()
    getAll() {
        return this.categoriesService.getAllCategories();
    }
    
    @ApiOperation({ summary: 'Get category by id' })
    @ApiResponse({ status: 200, type: Category })
    @Get('/:id')
    getOne(@Param() params) {
        if (this.checkId(params.id)) {
            return this.categoriesService.getCategoryById(params.id);
        }
        
        throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }

    @ApiOperation({ summary: 'Create category' })
    @ApiResponse({ status: 201, type: Category })
    @Post()
    create(@Body() categoryDto: CreateCategoryDto) {
        return this.categoriesService.createCategory(categoryDto);
    }

    @ApiOperation({ summary: 'Update category' })
    @ApiResponse({ status: 200, type: Category })
    @Put()
    update(@Body() categoryDto: UpdateCategoryDto) {
        return this.categoriesService.updateCategory(categoryDto);
    }

    @ApiOperation({ summary: 'Delete category' })
    @ApiResponse({ status: 200 })
    @Delete('/:id')
    delete(@Param() params) {
        if (this.checkId(params.id)) {
            return this.categoriesService.deleteCategory(params.id);
        }

        throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }
}
