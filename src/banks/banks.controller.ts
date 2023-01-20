import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger/dist';
import { Bank } from './banks.model';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@ApiTags('Banks')
@Controller('api/bank')
export class BanksController {
    constructor(private banksService: BanksService) {}

    private checkId(id) {
        return id == parseInt(id) && id > 0;
    }
    
    @ApiOperation({ summary: 'Get all banks' })
    @ApiResponse({ status: 200, type: [Bank] })
    @Get()
    getAll() {
        return this.banksService.getAllBanks();
    }
    
    @ApiOperation({ summary: 'Get bank by id' })
    @ApiResponse({ status: 200, type: Bank })
    @Get('/:id')
    getOne(@Param() params) {
        if (this.checkId(params.id)) {
            return this.banksService.getBankById(params.id);
        }
        
        throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }

    @ApiOperation({ summary: 'Create bank' })
    @ApiResponse({ status: 201, type: Bank })
    @Post()
    create(@Body() bankDto: CreateBankDto) {
        return this.banksService.createBank(bankDto);
    }

    @ApiOperation({ summary: 'Update bank' })
    @ApiResponse({ status: 200, type: Bank })
    @Put()
    update(@Body() bankDto: UpdateBankDto) {
        return this.banksService.updateBank(bankDto);
    }

    @ApiOperation({ summary: 'Delete bank' })
    @ApiResponse({ status: 200 })
    @Delete('/:id')
    delete(@Param() params) {
        if (this.checkId(params.id)) {
            return this.banksService.deleteBank(params.id);
        }

        throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }
}
