import { useState, useCallback, useMemo } from 'react'
import Range from 'rc-slider'
import Tooltip from 'rc-tooltip'
import 'rc-slider/assets/index.css'
import lodash from 'lodash'
import { useTranslation } from '@commerce/utils/use-translation'

interface PriceFilterSliderProps {
  handleFilters: (filters: any, type: string) => void
  sectionKey: string
  items: any[]
  routerFilters: any
}

const PriceFilterSlider: React.FC<PriceFilterSliderProps> = ({
  handleFilters,
  sectionKey,
  items,
  routerFilters,
}) => {
  const translate = useTranslation()
  const priceFilter = routerFilters?.find((filter: any) => { return filter?.Key === sectionKey })
  const step = 10
  const prices = [
    ...items.filter((item) => item?.to !== null).map((item) => item?.to),
    ...items.filter((item) => item?.from !== null).map((item) => item?.from),
  ]
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const limits = useMemo(() => { return { minFrom: minPrice, maxTo: maxPrice }; }, [minPrice, maxPrice]);
  const marks = useMemo(() => {
    const validMin = !isNaN(limits.minFrom) ? limits.minFrom : 0;
    const validMax = !isNaN(limits.maxTo) ? limits.maxTo : 100;
    
    return {
      [validMin]: `${validMin}`, 
      [validMax]: `${validMax}`,
    };
  }, [limits.minFrom, limits.maxTo]);
  
  const [selectedRange, setSelectedRange] = useState<[number, any]>([
    priceFilter ? parseInt(priceFilter?.Value?.split('-')[0]) : limits?.minFrom,
    priceFilter ? (priceFilter?.Value?.split('-')[1])==='*'? limits?.maxTo + step : (parseInt(priceFilter?.Value?.split('-')[1])) : limits?.maxTo + step,
  ])


  // Debounce the entire slider change function
  const debouncedSetRange = useCallback(lodash.debounce((range: any) => {
    routerFilters.forEach((filter: any) => {
      if (filter?.Key === sectionKey) {
        handleFilters(filter, 'REMOVE_FILTERS');
      }
    });
    handleFilters(range, 'ADD_FILTERS');
  }, 500),[])

  function onSliderChange(value: any) {
    setSelectedRange(value);

    const upperRange = value[1] > limits.maxTo ? '*' : value[1];
    const resultRange = {
      Key: 'price.raw.withTax',
      Value: `${value[0]}-${upperRange}`,
      IsSelected: true,
      name: 'Price',
    };

    debouncedSetRange(resultRange);
  }

  return (
    limits && (
      <div>
        <div className="w-full px-4">
          <Range
            min={limits.minFrom}
            max={limits.maxTo + step}
            marks={marks}
            step={step}
            range
            defaultValue={selectedRange}
            onChange={onSliderChange}
            allowCross={false}
            trackStyle={{ backgroundColor: '#345662' }}
            handleStyle={{
              backgroundColor: '#345662',
              borderColor: '#345662',
              opacity: 'step0%',
            }}
            style={{ width: '', marginTop: '20px' }}
            handleRender={(node, handleProps) => {
              return (
                <Tooltip
                  overlayInnerStyle={{ minHeight: 'auto' }}
                  overlay={handleProps.value}
                  placement="top"
                  mouseLeaveDelay={0}
                >
                  {node}
                </Tooltip>
              )
            }}
          />
        </div>
        <br />
        <p className="relative ml-0 text-sm text-gray-500 cursor-pointer filter-label dark:text-black">
          {translate('label.product.priceFilterSlider.minText')}: {selectedRange[0]}
          <br />
          {translate('label.product.priceFilterSlider.maxText')}:{' '}
          {selectedRange[1] > limits.maxTo || selectedRange[1] === '*' ? translate('label.product.priceFilterSlider.noLimitText') : selectedRange[1]}
        </p>
      </div>
    )
  )
}

export default PriceFilterSlider
