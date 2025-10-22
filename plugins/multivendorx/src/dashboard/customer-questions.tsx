/* global appLocalizer */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableCell, CommonPopup, getApiLink, CalendarInput, TextArea } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { __ } from '@wordpress/i18n';
import { store } from "@wordpress/blocks";

type StoreQnaRow = {
  id: number;
  product_name: string;
  product_link: string;
  question_text: string;
  answer_text?: string | null;
  author_name?: string;
  question_date?: string;
  time_ago?: string;
};
export interface RealtimeFilter {
  name: string;
  render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}
const StoreQna: React.FC = () => {
  const [data, setData] = useState<StoreQnaRow[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedQna, setSelectedQna] = useState<StoreQnaRow | null>(null);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string>();

  // Fetch total rows on mount
  useEffect(() => {
    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, 'qna'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: { count: true, store_id: appLocalizer.store_id },
    })
      .then((response) => {
        setTotalRows(response.data || 0);
        setPageCount(Math.ceil(response.data / pagination.pageSize));
      })
      .catch(() => {
        setError(__('Failed to load total rows', 'multivendorx'));
      });
  }, []);

  useEffect(() => {
    const currentPage = pagination.pageIndex + 1;
    const rowsPerPage = pagination.pageSize;
    requestData(rowsPerPage, currentPage);
    setPageCount(Math.ceil(totalRows / rowsPerPage));
  }, [pagination]);

  // Fetch data from backend.
  function requestData(
    rowsPerPage = 10,
    currentPage = 1,
    startDate = new Date(0),
    endDate = new Date(),
  ) {
    setData([]);
    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, 'qna'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: {
        store_id:appLocalizer.store_id,
        page: currentPage,
        row: rowsPerPage,
        startDate,
        endDate
      },
    })
      .then((response) => {
        setData(response.data || []);
      })
      .catch(() => {
        setError(__('Failed to load Q&A', 'multivendorx'));
        setData([]);
      });
  }

  // Handle pagination and filter changes
  const requestApiForData = (
    rowsPerPage: number,
    currentPage: number,
    filterData: FilterData
  ) => {
    setData([]);
    requestData(
      rowsPerPage,
      currentPage,
      filterData?.date?.start_date,
      filterData?.date?.end_date
    );
  };


  // Save answer
  const handleSaveAnswer = async () => {
    if (!selectedQna) return;
    setSaving(true);
    try {
      await axios.put(
        getApiLink(appLocalizer, `qna/${selectedQna.id}`),
        { answer_text: answer },
        { headers: { "X-WP-Nonce": appLocalizer.nonce } }
      );
      setData((prev) =>
        prev.map((q) =>
          q.id === selectedQna.id ? { ...q, answer_text: answer } : q
        )
      );
      setSelectedQna(null);
      setAnswer("");
    } catch (err) {
      console.error("Failed to save answer:", err);
      alert("Failed to save answer");
    } finally {
      setSaving(false);
    }
  };


  const columns: ColumnDef<StoreQnaRow>[] = [
    {
      id: 'select',
      header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
      cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
    },
    {
      header: __('Product Name', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.product_name || ''}>
          {row.original.product_name ? (
            <a href={row.original.product_link} target="_blank" rel="noreferrer">{row.original.product_name}</a>
          ) : '-'}
        </TableCell>
      )
    },
    {
      header: __('Question', 'multivendorx'),
      cell: ({ row }) => {
        const text = row.original.question_text ?? '-';
        const displayText = text.length > 50 ? text.slice(0, 50) + '…' : text;
        return <TableCell title={text}>{displayText}</TableCell>;
      }
    },
    {
      header: __('Answer', 'multivendorx'),
      cell: ({ row }) => {
        const text = row.original.answer_text ?? '-';
        const displayText = text.length > 50 ? text.slice(0, 50) + '…' : text;
        return <TableCell title={text}>{displayText}</TableCell>;
      }
    },
    {
      header: __('Asked By', 'multivendorx'),
      cell: ({ row }) => <TableCell title={row.original.author_name || ''}>{row.original.author_name ?? '-'}</TableCell>
    },
    {
      header: __('Date', 'multivendorx'),
      accessorFn: row => row.question_date ? new Date(row.question_date).getTime() : 0, // numeric timestamp for sorting
      enableSorting: true,
      cell: ({ row }) => {
        const rawDate = row.original.question_date;
        const formattedDate = rawDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(rawDate)) : '-';
        return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
      }
    },
    {
      header: __('Time Ago', 'multivendorx'),
      accessorFn: row => {
        // Parse "2 weeks ago", "3 days ago", etc., to approximate days
        const str = row.time_ago || '';
        const parts = str.split(' ');
        if (parts.length < 2) return 0;
        const value = parseInt(parts[0]) || 0;
        const unit = parts[1].toLowerCase();
        switch (unit) {
          case 'minute':
          case 'minutes': return value / 60; // fraction of hour
          case 'hour':
          case 'hours': return value; // in hours
          case 'day':
          case 'days': return value * 24; // in hours
          case 'week':
          case 'weeks': return value * 24 * 7;
          case 'month':
          case 'months': return value * 24 * 30;
          case 'year':
          case 'years': return value * 24 * 365;
          default: return 0;
        }
      },
      enableSorting: true,
      cell: ({ row }) => <TableCell title={row.original.time_ago || ''}>{row.original.time_ago ?? '-'}</TableCell>
    },
    {
      header: __('Votes', 'multivendorx'),
      cell: ({ row }) => <TableCell title={String(row.original.total_votes) || ''}>{row.original.total_votes ?? 0}</TableCell>
    },
    {
      header: __('Visibility', 'multivendorx'),
      cell: ({ row }) => <TableCell title={row.original.question_visibility || ''}>{row.original.question_visibility ?? '-'}</TableCell>
    },
    {
      header: __('Action', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell
          type="action-dropdown"
          rowData={row.original}
          header={{
            actions: [
              {
                label: __('Answer', 'multivendorx'),
                icon: 'adminlib-eye', // you can change the icon
                onClick: (rowData) => {
                  setSelectedQna(rowData);
                  setAnswer(rowData.answer_text || '');
                },
                hover: true,
              },
            ],
          }}
        />
      ),
    }
    
  ];

  const realtimeFilter: RealtimeFilter[] = [
    {
      name: 'date',
      render: (updateFilter) => (
        <div className="right">
          <CalendarInput
            wrapperClass=""
            inputClass=""
            onChange={(range: any) => updateFilter('date', { start_date: range.startDate, end_date: range.endDate })}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="admin-table-wrapper">
        <Table
          data={data}
          columns={columns as ColumnDef<Record<string, any>, any>[]}
          rowSelection={{}}
          onRowSelectionChange={() => { }}
          defaultRowsPerPage={10}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          perPageOption={[10, 25, 50]}
          realtimeFilter={realtimeFilter}
          handlePagination={requestApiForData}
          totalCounts={totalRows}
        />
      </div>

      {selectedQna && (
        <CommonPopup
            open={selectedQna}
            onClose={setSelectedQna}
            width="500px"
            header={
                <>
                    <div className="title">
                        <i className="adminlib-cart"></i>
                        Answer Question
                    </div>
                    <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                </>
            }
            footer={
                <>
                    <button
                        type="button" 
                        onClick={() => setSelectedQna(null)}
                        className="admin-btn btn-red"
                    >
                        Cancel
                    </button>
                    <button onClick={handleSaveAnswer} disabled={saving} className="admin-btn btn-purple">
                        {saving ? "Saving..." : "Save Answer"}
                    </button>
                </>
            }

        >
        <div className="content">
          <div className="form-group-wrapper">
              <div className="form-group">
                  <label htmlFor="title">Question:  {selectedQna.question_text}</label>
                  <TextArea
                      name="content"
                      inputClass="textarea-input"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                  />
              </div>
              <span className="space"></span>
          </div>
      </div>
        </CommonPopup>
      )}
    </>
  );
};

export default StoreQna;
