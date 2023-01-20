import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Category } from 'src/categories/categories.model';
import { CategoriesTransactions } from 'src/transactions/categories-transactions.model';
import { Transaction } from 'src/transactions/transactions.model';
import { InputDataDto } from './dto/input-data.dto';

@Injectable()
export class StatisticsService {
    constructor(@InjectModel(Category) private categoriesRepository: typeof Category,
                @InjectModel(Transaction) private transactionsRepository: typeof Transaction) {}

    async getStatistics(dto: InputDataDto) {
        const from = dto.fromDate.replace(/\D/g, '-');
        const to = dto.toDate.replace(/\D/g, '-');

        const transactionsByCategories = await this.categoriesRepository.findAll({
            order: ['id'],
            include: [
                {
                    model: this.transactionsRepository,
                    where: {
                        createdAt: {
                            [Op.between]: [from, to]
                        }
                    }
                }
            ],
            where: {
                id: dto.categories
            }
        });

        // return transactionsByCategories.map(category => {
        //     const result = {};
        //     const totalAmount = category.transactions.reduce((a, b: any) => {
        //         return b.type === 'profitable' ? a + +b.CategoriesTransactions.amount : a - +b.CategoriesTransactions.amount;
        //     }, 0);

        //     result[category.name] = totalAmount > 0 ? "+" + totalAmount : "" + totalAmount;

        //     return result;
        // });

        const statistics: { [key: string]: string } = {};

        for (let category of transactionsByCategories) {
            const result = {};
            const totalAmount = category.transactions.reduce((a, b: any) => {
                return b.type === 'profitable' ? a + +b.CategoriesTransactions.amount : a - +b.CategoriesTransactions.amount;
            }, 0);

            statistics[category.name] = totalAmount > 0 ? "+" + totalAmount : "" + totalAmount;
        };

        return {
            status: 'success',
            data: statistics
        };
    }
}
