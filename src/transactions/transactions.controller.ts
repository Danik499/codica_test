import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger/dist/decorators';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './transactions.model';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('api/transaction')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    private checkId(id) {
        return id == parseInt(id) && id > 0;
    }

    private checkPageNumber(page) {
        return page == parseInt(page) && page > 0;
    }

    @ApiOperation({ summary: 'Get transactions' })
    @ApiResponse({ status: 200, type: [Transaction] })
    @Get('/:page')
    getTransaction(@Param() params) {
        if (this.checkPageNumber(params.page)) {
            return this.transactionsService.getTransactions(+params.page);
        }
        
        throw new HttpException('Invalid page format', HttpStatus.BAD_REQUEST);
    }

    @ApiOperation({ summary: 'Create transaction' })
    @ApiResponse({ status: 200, type: Transaction })
    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionsService.createTransaction(dto);
    }
    
    @ApiOperation({ summary: 'Delete Transaction' })
    @ApiResponse({ status: 200 })
    @Delete('/:id')
    deleteTransaction(@Param() params) {
        if (this.checkId(params.id)) {
            return this.transactionsService.deleteTransaction(+params.id);
        }

        throw new HttpException('Invalid id format', HttpStatus.BAD_REQUEST);
    }
}
