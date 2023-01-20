import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger/dist/decorators';
import { InputDataDto } from './dto/input-data.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Statistics')
@Controller('api/statistics')
export class StatisticsController {
    constructor(private statisticsService: StatisticsService) {}

    @ApiOperation({ summary: 'Get statistics' })
    @ApiResponse({ status: 200, type: InputDataDto })
    @Post()
    getStatistics(@Body() inputDto: InputDataDto) {
        return this.statisticsService.getStatistics(inputDto);
    }
}
