const Dayjs = require('dayjs');
const BudgetCalculator = require('./budget.calculator');
let mockBudgetRepo = jest.fn();
jest.mock('./budgetRepo', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getAll: mockBudgetRepo
        };
    });
});
describe('budget calculator', function () {
    const setInterval = (start, end) => {
        const startDay = new Dayjs(start);
        const endDay = new Dayjs(end);
        return [startDay, endDay];
    };
    it('single day', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210101', '20210101');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(1);
    });
    it('multiple days', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210101', '20210102');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(2);
    });
    it('single month', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210101', '20210131');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(31);
    });
    it('cross full months', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210101', '20210228');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            }, {
                yearMonth: '202102',
                amount: 280
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(311);
    });
    it('cross partial month', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210131', '20210202');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            },
            {
                yearMonth: '202102',
                amount: 2800
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(201);
    });
    it('cross full month', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210130', '20210302');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            },
            {
                yearMonth: '202102',
                amount: 280
            },
            {
                yearMonth: '202103',
                amount: 31000
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(2282);
    });
    it('miss end month data', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210130', '20210302');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            },
            {
                yearMonth: '202102',
                amount: 280
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(282);
    });
    it('miss start month data', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210130', '20210302');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202102',
                amount: 280
            },
            {
                yearMonth: '202103',
                amount: 31000
            }
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(2280);
    });
    it('start day is later than end day', function () {
        let budgetCalculator = new BudgetCalculator();
        const [startDay, endDay] = setInterval('20210104', '20210102');
        mockBudgetRepo.mockReturnValue([
            {
                yearMonth: '202101',
                amount: 31
            },
        ]);
        expect(budgetCalculator.query(startDay, endDay)).toBe(0);
    });
});