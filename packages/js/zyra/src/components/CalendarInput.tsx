// /**
//  * External dependencies
//  */
// import React, { useState } from 'react';
// import DatePicker from 'react-multi-date-picker';

// // Types
// interface CalendarInputProps {
//     wrapperClass?: string;
//     inputClass?: string;
//     format?: string;
//     multiple?: boolean;
//     range?: boolean;
//     value: string;
//     onChange?: ( date: any ) => void;
//     proSetting?: boolean;
// }

// const CalendarInput: React.FC< CalendarInputProps > = ( props ) => {
//     let formattedDate: any;
//     const dates = props.value.split( ',' );

//     if ( dates.length === 1 && ! dates[ 0 ].includes( ' - ' ) ) {
//         formattedDate = new Date( dates[ 0 ].trim() );
//     } else {
//         formattedDate = dates.map( ( date ) => {
//             if ( date.includes( ' - ' ) ) {
//                 const rangeDates = date.split( ' - ' );
//                 const startDate = new Date( rangeDates[ 0 ].trim() );
//                 const endDate = new Date( rangeDates[ 1 ].trim() );
//                 return [ startDate, endDate ];
//             }
//             return new Date( date.trim() );
//         } );
//     }

//     const [ selectedDate, setSelectedDate ] = useState< any >(
//         formattedDate || ''
//     );

//     const handleDateChange = ( e: any ) => {
//         setSelectedDate( e );
//         props.onChange?.( e );
//     };

//     return (
//         <div className={ props.wrapperClass }>
//             <DatePicker
//                 className={ props.inputClass }
//                 format={ props.format || 'YYYY-MM-DD' }
//                 multiple={ props.multiple }
//                 range={ props.range }
//                 value={ selectedDate }
//                 placeholder={ 'YYYY-MM-DD' }
//                 onChange={ handleDateChange }
//             />
//             { props.proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span> }
//         </div>
//     );
// };

// export default CalendarInput;


/**
 * External dependencies
 */
import React, { useState, useRef } from 'react';
import { DateRangePicker, Range, RangeKeyDict } from 'react-date-range';

interface CalendarInputProps {
    wrapperClass?: string;
    inputClass?: string;
    format?: string;
    multiple?: boolean;
    range?: boolean;
    value?: { startDate: Date; endDate: Date }; // better type
    onChange?: (date: { startDate: Date; endDate: Date }) => void;
    proSetting?: boolean;
}

const CalendarInput: React.FC<CalendarInputProps> = (props) => {
    const [selectedRange, setSelectedRange] = useState<Range[]>([
        {
            startDate:
                props.value?.startDate ||
                new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: props.value?.endDate || new Date(),
            key: 'selection',
        },
    ]);

    const [pickerPosition, setPickerPosition] = useState<'top' | 'bottom'>('bottom');
    const dateRef = useRef<HTMLDivElement | null>(null);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const handleDateOpen = () => {
        if (dateRef.current) {
            const rect = dateRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            setPickerPosition(viewportHeight - rect.bottom < 300 ? 'top' : 'bottom');
        }
        setOpenDatePicker((prev) => !prev);
    };

    const handleDateChange = (ranges: RangeKeyDict) => {
        const selection: Range = ranges.selection;

        if (selection?.endDate instanceof Date) {
            // ensure end of day for endDate
            selection.endDate.setHours(23, 59, 59, 999);
        }

        const newRange = [
            {
                startDate: selection.startDate || new Date(),
                endDate: selection.endDate || new Date(),
                key: selection.key || 'selection',
            },
        ];

        setSelectedRange(newRange);
        props.onChange?.({
            startDate: newRange[0].startDate!,
            endDate: newRange[0].endDate!,
        });
    };

    return (
        <div className={props.wrapperClass}>
            <div className="date-picker-section-wrapper" ref={dateRef}>
                <input
                    value={`${selectedRange[0].startDate?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                    })} - ${selectedRange[0].endDate?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                    })}`}
                    onClick={handleDateOpen}
                    className={props.inputClass || 'basic-input'}
                    type="text"
                    readOnly
                    placeholder="DD/MM/YYYY"
                />
                {openDatePicker && (
                    <div
                        className={`date-picker ${
                            pickerPosition === 'top' ? 'open-top' : 'open-bottom'
                        }`}
                        id="date-picker-wrapper"
                    >
                        <DateRangePicker
                            ranges={selectedRange}
                            months={1}
                            direction="vertical"
                            scroll={{ enabled: true }}
                            maxDate={new Date()}
                            onChange={handleDateChange}
                        />
                    </div>
                )}
            </div>
            {props.proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminlib-pro-tag"></i>Pro
                </span>
            )}
        </div>
    );
};

export default CalendarInput;
