import React, { useState } from "react";
import {
  DataTable,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarAction,
  TableBatchActions,
  TableBatchAction,
  TableSelectAll,
  TableSelectRow,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Pagination,
} from "@carbon/react";
import { TrashCan, Download, Renew } from "@carbon/icons-react";

/**
 * OperationalDataTable Pattern (MOVA Domain Pattern)
 * MOVA Pattern orchestrating Carbon DataTable + Carbon Pagination with enterprise operational workflows:
 * - Full header sorting & filtering
 * - Global search toolbar
 * - Batch selection actions bar
 * - Expandable row details
 * - Dynamic size density (compact, short, md, lg)
 * - Integrated Carbon Pagination
 */
export function OperationalDataTable({
  rows = [],
  headers = [],
  title,
  description,
  size = "md", // "compact" | "short" | "md" | "lg"
  useZebraStyles = false,
  isSortable = true,
  isExpandable = false,
  renderExpandedRow,
  batchActions = [],
  onBatchAction,
  toolbarActions = [],
  searchPlaceholder = "Filter operational table...",
  pageSize = 10,
  pageSizes = [5, 10, 20, 50],
  totalItems,
  onPageChange,
  className = "",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Client-side pagination slice if totalItems not externally controlled
  const paginatedRows = totalItems !== undefined
    ? rows
    : rows.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize);

  const handlePaginationChange = ({ page, pageSize: newSize }) => {
    setCurrentPage(page);
    setCurrentPageSize(newSize);
    if (onPageChange) {
      onPageChange({ page, pageSize: newSize });
    }
  };

  return (
    <div className={`cds-operational-data-table w-full space-y-[var(--cds-spacing-03)] ${className}`}>
      <DataTable
        rows={paginatedRows}
        headers={headers}
        isSortable={isSortable}
        useZebraStyles={useZebraStyles}
        size={size}
      >
        {({
          rows: tableRows,
          headers: tableHeaders,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getToolbarProps,
          getBatchActionProps,
          onInputChange,
          selectedRows,
          getTableProps,
          getTableContainerProps,
          getExpandHeaderProps,
        }) => {
          const batchActionProps = getBatchActionProps();

          return (
            <TableContainer title={title} description={description} {...getTableContainerProps()}>
              <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                <TableBatchActions {...batchActionProps}>
                  {batchActions.length > 0 ? (
                    batchActions.map((action, idx) => (
                      <TableBatchAction
                        key={idx}
                        renderIcon={action.icon || TrashCan}
                        onClick={() => onBatchAction && onBatchAction(action.id, selectedRows)}
                        hasIconOnly={action.hasIconOnly}
                        iconDescription={action.label}
                      >
                        {action.label}
                      </TableBatchAction>
                    ))
                  ) : (
                    <TableBatchAction
                      renderIcon={TrashCan}
                      onClick={() => onBatchAction && onBatchAction("delete", selectedRows)}
                    >
                      Delete ({selectedRows.length})
                    </TableBatchAction>
                  )}
                </TableBatchActions>

                <TableToolbarContent>
                  <TableToolbarSearch
                    persistent={false}
                    placeholder={searchPlaceholder}
                    onChange={onInputChange}
                  />
                  {toolbarActions.map((action, idx) => (
                    <TableToolbarAction
                      key={idx}
                      renderIcon={action.icon || Renew}
                      iconDescription={action.label}
                      onClick={action.onClick}
                    />
                  ))}
                </TableToolbarContent>
              </TableToolbar>

              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {isExpandable && <TableExpandHeader {...getExpandHeaderProps()} />}
                    <TableSelectAll {...getSelectionProps()} />
                    {tableHeaders.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableRows.map((row) => {
                    const rowProps = getRowProps({ row });
                    const isExpanded = isExpandable && row.isExpanded;

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow {...rowProps}>
                          {isExpandable && (
                            <TableExpandRow {...rowProps} onExpand={() => {}} isExpanded={isExpanded} />
                          )}
                          <TableSelectRow {...getSelectionProps({ row })} />
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpandable && isExpanded && (
                          <TableExpandedRow colSpan={tableHeaders.length + 2}>
                            {renderExpandedRow ? renderExpandedRow(row) : null}
                          </TableExpandedRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }}
      </DataTable>

      {/* Carbon Standard Pagination */}
      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText="Items per page:"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={currentPageSize}
        pageSizes={pageSizes}
        totalItems={totalItems !== undefined ? totalItems : rows.length}
        onChange={handlePaginationChange}
      />
    </div>
  );
}
