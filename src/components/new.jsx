import React, { Fragment, useState } from 'react';
import { Row, Col, Badge, Button } from 'reactstrap';
import ReactTable from 'react-table-6';
import 'react-table-6/react-table.css';

const App = () => {
  const [data] = useState(testData);

  const columns = [
    {
      Header: 'S.no.',
      maxWidth: 50,
      filterable: false,
      Cell: (cellInfo) => (
        <div className="text-center">
          <span>{cellInfo.index + 1}</span>
        </div>
      ),
    },
    {
      Header: 'Task Name',
      accessor: 'task_name',
    },
    {
      Header: 'Progress View',
      accessor: 'progress_view',
      maxWidth: 300,
      filterable: false,
      Cell: (cellInfo) => (
        <Fragment>
          <div
            className={
              cellInfo.row.progress_view === 3
                ? 'progress-status three'
                : 'progress-status' &&
                  cellInfo.row.progress_view === 2
                ? 'progress-status two'
                : 'progress-status' &&
                  cellInfo.row.progress_view === 1
                ? 'progress-status one'
                : 'progress-status'
            }
          >
            <div className="line one"></div>
            <div className="dot one"></div>
            <div className="line two"></div>
            <div className="dot two"></div>
            <div className="line three"></div>
            <div className="dot three"></div>
          </div>
        </Fragment>
      ),
    },
    {
      Header: 'Priority',
      accessor: 'priority',
      maxWidth: 200,
      Cell: (cellInfo) => (
        <Fragment>
          <div className="priority-inner">
            <div
              className={
                cellInfo.row.priority === 'High Priority'
                  ? 'priority-badge high'
                  : 'priority-badge' &&
                    cellInfo.row.priority === 'Medium Priority'
                  ? 'priority-badge medium'
                  : 'priority-badge' &&
                    cellInfo.row.priority === 'Low Priority'
                  ? 'priority-badge low'
                  : 'priority-badge'
              }
            ></div>
            {cellInfo.row.priority}
          </div>
        </Fragment>
      ),
    },
    {
      Header: 'Notifiaction',
      accessor: 'notifiaction',
      maxWidth: 200,
      filterable: false,
      Cell: (cellInfo) => (
        <div className="notification-td">
          <i className="mdi mdi-message-text-outline"></i>
          <sup>
            <Badge
              color={
                cellInfo.row.notifiaction < 5
                  ? 'primary'
                  : 'secondary' &&
                    cellInfo.row.notifiaction < 10
                  ? 'warning'
                  : 'secondary' &&
                    cellInfo.row.notifiaction < 20
                  ? 'danger'
                  : 'secondary'
              }
            >
              {cellInfo.row.notifiaction}
            </Badge>
          </sup>
        </div>
      ),
    },
    {
      Header: 'Action',
      maxWidth: 200,
      filterable: false,
      Cell: (row) => (
        <div className="text-center">
          <Button
            outline
            color="primary"
            size="sm"
            onClick={() => console.log('row', row)}
          >
            In Progress
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Fragment>
      <Row>
        <Col>
          <div className="super-admin-table">
            <h3 className="mb-3">All Task</h3>
            <ReactTable
              style={{ height: '500px', width: '100%' }}
              data={data}
              columns={columns}
              defaultPageSize={7}
              filterable={true}
              minRows={7}
              defaultFilterMethod={(filter, row) => {
                const id = filter.pivotId || filter.id;
                return row[id] !== undefined
                  ? String(row[id].toLowerCase()).startsWith(
                      filter.value.toLowerCase()
                    )
                  : true;
              }}
            />
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

export default App;
