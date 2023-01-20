import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateTransactionDto, TransactionCategory, TransactionTypes } from './dto/create-transaction.dto';
import { Transaction } from './transactions.model';
import { Bank } from 'src/banks/banks.model';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { CategoriesTransactions } from './categories-transactions.model';
import { Category } from 'src/categories/categories.model';
import { CreateCategoriesTransactionsDto } from './dto/create-categories-transactions.dto';

@Injectable()
export class TransactionsService {
    constructor(@InjectModel(Transaction) private transactionsRepository: typeof Transaction,
                @InjectModel(Bank) private banksRepository: typeof Bank,
                @InjectModel(Category) private categoriesRepository: typeof Category,
                @InjectModel(CategoriesTransactions) private categoriesTransactionsRepository: typeof CategoriesTransactions) {}

    private validateTransactionBody(transactionToCreate: CreateTransactionDto) {
        if (!transactionToCreate.bank) {
            throw new HttpException('Bank id should be provided', HttpStatus.BAD_REQUEST);
        }

        if (!transactionToCreate.type || !Object.values(TransactionTypes).includes(transactionToCreate.type)) {
            throw new HttpException('Transaction type should be \'profitable\' or \'consumable\'', HttpStatus.BAD_REQUEST);
        }

        transactionToCreate.categories.forEach((category: TransactionCategory) => {
            if (!category.name || !category.amount) {
                throw new HttpException('All categories should have \'name\' and \'amount\'', HttpStatus.BAD_REQUEST);
            }
        });
    }

    async createTransaction(dto: CreateTransactionDto) {
        this.validateTransactionBody(dto)

        const bank = await this.banksRepository.findByPk(dto.bank);
        const total = dto.categories.reduce((a: number, b: TransactionCategory) => {
            return a + b.amount;
        }, 0);

        if (dto.type === 'consumable' && +bank.dataValues.balance < total) {
            throw new HttpException('Bank balance is not enough for this transaction', HttpStatus.BAD_REQUEST);
        }

        const transaction = await this.transactionsRepository.create(dto, { returning: true });
        const categories = [];

        for (let category of dto.categories) {
            const categoryId = await this.categoriesRepository.findOne({ where: { name: category.name } });
            if (!categoryId) {
                throw new HttpException(`Category '${category.name}' not found`, HttpStatus.NOT_FOUND);
            }

            if (category.amount <= 0) {
                throw new HttpException(`Amount of category '${category.name}' should be positive`, HttpStatus.BAD_REQUEST);
            }

            categories.push({ id: categoryId.dataValues.id, ...category });
        }

        for (let category of categories) {
            const categoryTransaction: CreateCategoriesTransactionsDto = {
                transaction: transaction.dataValues.id,
                category: category.id,
                amount: category.amount
            }

            await this.categoriesTransactionsRepository.create(categoryTransaction);
        }

        const newBalance = dto.type === 'profitable' ? +bank.dataValues.balance + total : +bank.dataValues.balance - total;
        await this.banksRepository.update({ balance: newBalance }, {
            where: { id: bank.dataValues.id }
        });

        return transaction;
    }

    async getTransactions(page: number) {
        const pageSize = 5;

        const transactions = await this.transactionsRepository.findAll({
            order: ['id'],
            offset: (page - 1) * pageSize,
            limit: pageSize
        });

        if (!transactions[0]) {
            throw new HttpException('No transactions on this page', HttpStatus.NOT_FOUND);
        }

        const [start, end] = [transactions[0].id, transactions[transactions.length - 1].id];
        const transactionsInfo = await this.transactionsRepository.findAll({
            include: [
                {
                    model: this.categoriesTransactionsRepository
                },
                {
                    model: this.categoriesRepository
                }
            ],
            where: {
                id: { [Op.between]: [start, end] }
            },
            order: ['id']
        });

        const transactionsGrouped = [];

        for (let transaction of transactionsInfo) {
            transactionsGrouped.push({
                id: transaction.id,
                bank_id: transaction.bank,
                type: transaction.type,
                webhook: transaction.webhook,
                created_at: transaction.createdAt,
                updated_at: transaction.updatedAt,
                categories: transaction.categories_transactions.map(category => {
                    return {
                        name: transaction.categories.find(c => c.id === category.category).name,
                        amount: category.amount
                    }
                })
            });
        }

        return transactionsGrouped;
    }

    async deleteTransaction(id: number) {
        const transaction = await this.transactionsRepository.findByPk(id);
        if (!transaction) {
            throw new HttpException('The transaction could not be found', HttpStatus.NOT_FOUND);
        }

        const transactionCategories = await this.categoriesTransactionsRepository.findAll({ where: { transaction: id } });

        const total = transactionCategories.reduce((a, b) => {
            return a + +b.amount;
        }, 0);

        const bank = await this.banksRepository.findByPk(transaction.bank);

        const newBalance = transaction.type === 'profitable' ? +bank.dataValues.balance - total : +bank.dataValues.balance + total;

        await this.banksRepository.update({ balance: newBalance }, {
            where: { id: bank.dataValues.id }
        });

        await  this.transactionsRepository.destroy({ where: { id } });

        return {
            status: 'success'
        };
    }
}
