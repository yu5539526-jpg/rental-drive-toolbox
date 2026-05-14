export const ENERGY_DEFAULTS = {
  oil: {
    label: '油车',
    fuelConsumption: 8.0,
    fuelPrice: 8.3,
    unitText: '8.0L/100km，汽油 8.3元/L',
    formulaText: '总里程 / 100 * 8.0 * 8.3',
    getCost: (mileage) => (mileage / 100) * 8.0 * 8.3,
  },
  electric: {
    label: '新能源',
    electricConsumption: 17,
    electricPrice: 1.5,
    unitText: '17kWh/100km，公共充电 1.5元/kWh',
    formulaText: '总里程 / 100 * 17 * 1.5',
    getCost: (mileage) => (mileage / 100) * 17 * 1.5,
  },
  extended: {
    label: '增程',
    costPerKm: 0.48,
    unitText: '长途油电混合 0.48元/km',
    formulaText: '总里程 * 0.48',
    getCost: (mileage) => mileage * 0.48,
  },
};

export const ENERGY_NOTE =
  '当前能源费用为系统估算值，实际费用会受车型、驾驶习惯、路况、油价、电价和充电时段影响。';
