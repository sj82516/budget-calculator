const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);
const {filter} = require('lodash');
const BudgetRepo = require('./budgetRepo');
module.exports = class BudgetCalculator {
    query(startDay, endDay) {
        const budgetRepo = new BudgetRepo();
        const allBudget = budgetRepo.getAll();
        let filteredBudget = this.filterBudget(allBudget, startDay, endDay, false);
        let budgetMap = this.budgetMap(filteredBudget);
        let total = 0;
        if (startDay.isAfter(endDay)) {
            return 0;
        }
        if (this.isSameMonth(startDay, endDay)) {
            return this.getBudgetValue(budgetMap, startDay) * (endDay.diff(startDay, 'day') + 1) / startDay.daysInMonth();
        }
        const startMonthBudget = (startDay.endOf('month').diff(startDay, 'day') + 1)
            * this.getBudgetValue(budgetMap, startDay) / startDay.daysInMonth();
        const endMonthDayBudget = endDay.date() * this.getBudgetValue(budgetMap, endDay) / endDay.daysInMonth();
        total += startMonthBudget;
        total += endMonthDayBudget;
        filteredBudget = this.filterBudget(allBudget, startDay, endDay, true);
        filteredBudget.forEach(budget => {
            total += budget.amount;
        });
        return total;
    }

    isSameMonth(startDay, endDay) {
        return startDay.isSame(endDay, 'year') && startDay.isSame(endDay, 'month');
    }

    getBudgetValue(budgetMap, day) {
        return budgetMap[day.format('YYYYMM')] || 0;
    }

    filterBudget(allBudget, startDay, endDay, exclusive) {
        return filter(allBudget, ({yearMonth}) => {
            return dayjs(yearMonth).isBetween(startDay.format('YYYYMM'), endDay.format('YYYYMM'), null, exclusive ? '()' : '[]');
        });
    }

    budgetMap(allBudget) {
        let result = {};
        allBudget.forEach((budget) => {
            result[budget.yearMonth] = budget.amount;
        });
        return result;
    }
};

