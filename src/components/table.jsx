import React from 'react'

const Table = ({ rows, columns }) => {
    return (
        <table className='table table-bordered table-striped w-100' style={{ overflowX: 'auto' }}>
            <thead className='table-head bg-primary text-white'>
                <tr style={{ borderRadius: "10px 0px 0px 10px" }}>
                    {
                        columns.map((data, index) => (
                            <th className='text-nowrap' key={index}
                                style={{ borderRadius: index === 0 ? "10px 0px 0px 0px" : index === columns.length - 1 && "0px 10px 0px 0px" }}
                            >{data?.label}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((column, colIndex) => (
                            <td key={colIndex}>{row[column.key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table
