/* global appLocalizer */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableCell, CommonPopup, getApiLink } from "zyra";
import { ColumnDef, PaginationState } from "@tanstack/react-table";

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

  // Fetch total count separately
  const fetchTotalCount = async () => {
    try {
      const res = await axios.get(getApiLink(appLocalizer, "qna"), {
        params: { store_id: appLocalizer.store_id, count: true },
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      });
      setTotalCount(res.data || 0);
    } catch (err) {
      console.error("Failed to fetch total count:", err);
    }
  };

  // Fetch paginated data
  const fetchData = async (page = 1, perPage = 10) => {
    try {
      const res = await axios.get(getApiLink(appLocalizer, "qna"), {
        params: { store_id: appLocalizer.store_id, page, row: perPage },
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      });
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch Q&A:", err);
    }
  };

  useEffect(() => {
    fetchTotalCount(); // separate API for count
  }, []);

  useEffect(() => {
    fetchData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

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
    { header: "Product", cell: ({ row }) => <TableCell>{row.original.product_name}</TableCell> },
    { header: "Question", cell: ({ row }) => <TableCell>{row.original.question_text}</TableCell> },
    { header: "Answer", cell: ({ row }) => <TableCell>{row.original.answer_text || "-"}</TableCell> },
    { header: "Asked By", cell: ({ row }) => <TableCell>{row.original.author_name || "-"}</TableCell> },
    {
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.question_date ? new Date(row.original.question_date) : null;
        return (
          <TableCell>
            {date
              ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "-"}
          </TableCell>
        );
      },
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <TableCell>
          <button onClick={() => { setSelectedQna(row.original); setAnswer(row.original.answer_text || ""); }}>
            Answer
          </button>
        </TableCell>
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
          onRowSelectionChange={() => {}}
          defaultRowsPerPage={pagination.pageSize}
          pageCount={Math.ceil(totalCount / pagination.pageSize)}
          pagination={pagination}
          onPaginationChange={setPagination}
          perPageOption={[10, 25, 50]}
          totalCounts={totalCount} // from separate count API
        />
      </div>

      {selectedQna && (
        <CommonPopup
          open={!!selectedQna}
          width="500px"
          height="100%"
          header={<div>Answer Question</div>}
          footer={
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSaveAnswer} disabled={saving}>
                {saving ? "Saving..." : "Save Answer"}
              </button>
              <button onClick={() => setSelectedQna(null)}>Cancel</button>
            </div>
          }
        >
          <div>
            <p><b>Question:</b> {selectedQna.question_text}</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              style={{ width: "100%" }}
            />
          </div>
        </CommonPopup>
      )}
    </>
  );
};

export default StoreQna;
