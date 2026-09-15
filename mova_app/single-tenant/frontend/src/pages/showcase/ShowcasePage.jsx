import React, { useState } from "react";
import {
  Grid,
  Row,
  Column,
  Button,
  TextInput,
  PasswordInput,
  Select,
  SelectItem,
  ComboBox,
  Dropdown,
  Checkbox,
  Toggle,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tag,
  Tile,
  ClickableTile,
  ExpandableTile,
  Accordion,
  AccordionItem,
  ToastNotification,
  InlineNotification,
  ProgressBar,
  InlineLoading,
  SkeletonText,
  SkeletonPlaceholder,
  DataTableSkeleton,
  Tooltip,
  CarbonBarChart,
  CarbonLineChart,
  CarbonDonutChart,
  CarbonMeterChart,
  CarbonComboChart,
} from "../../design-system/components/index.js";
import {
  PageHeader,
  FilterBar,
  MasterDetailPanel,
  ConfirmationModal,
  EmptyStatePattern,
  OperationalDataTable,
} from "../../design-system/patterns/index.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Add,
  TrashCan,
  Filter,
  Map,
  Settings,
  Location,
  UserFollow,
  DeliveryTruck,
  Analytics,
  Renew,
  CheckmarkOutline,
  WarningAlt,
  Error,
  Information,
  View,
} from "@carbon/icons-react";

export function ShowcasePage() {
  const { theme, setTheme, carbonTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [motionActive, setMotionActive] = useState(false);

  // Sample Table Data for Operational DataTable
  const tableHeaders = [
    { key: "id", header: "Zone ID" },
    { key: "name", header: "Zone Name" },
    { key: "code", header: "Area Code" },
    { key: "riders", header: "Active Riders" },
    { key: "compliance", header: "SLA / Compliance" },
    { key: "status", header: "Status" },
  ];

  const tableRows = [
    {
      id: "Z-01",
      name: "Alun-Alun Sidoarjo Hub",
      code: "Z-SDA-01",
      riders: "4 Riders",
      compliance: "94.5%",
      status: <Tag type="green" size="sm">OPTIMAL</Tag>,
    },
    {
      id: "Z-02",
      name: "Kawasan Industri Gedangan",
      code: "Z-GDG-02",
      riders: "2 Riders",
      compliance: "68.2%",
      status: <Tag type="yellow" size="sm">WARNING</Tag>,
    },
    {
      id: "Z-03",
      name: "Krian Central Sub-hub",
      code: "Z-KRN-03",
      riders: "0 Riders",
      compliance: "0.0%",
      status: <Tag type="gray" size="sm">INACTIVE</Tag>,
    },
    {
      id: "Z-04",
      name: "Jalan Pahlawan Restricted",
      code: "Z-PHL-04",
      riders: "1 Rider",
      compliance: "32.0%",
      status: <Tag type="red" size="sm">DEVIATED</Tag>,
    },
    {
      id: "Z-05",
      name: "Waru Logistics Corridor",
      code: "Z-WRU-05",
      riders: "5 Riders",
      compliance: "98.0%",
      status: <Tag type="green" size="sm">OPTIMAL</Tag>,
    },
  ];

  // Chart Sample Datasets
  const barChartData = [
    { group: "Alun-Alun", value: 120 },
    { group: "Gedangan", value: 85 },
    { group: "Krian", value: 45 },
    { group: "Pahlawan", value: 30 },
    { group: "Waru", value: 160 },
  ];

  const lineChartData = [
    { date: "08:00", value: 40, group: "Rider Activity" },
    { date: "10:00", value: 85, group: "Rider Activity" },
    { date: "12:00", value: 130, group: "Rider Activity" },
    { date: "14:00", value: 95, group: "Rider Activity" },
    { date: "16:00", value: 150, group: "Rider Activity" },
    { date: "18:00", value: 110, group: "Rider Activity" },
  ];

  const donutChartData = [
    { group: "Active Dispatch", value: 18 },
    { group: "Idle / Standby", value: 6 },
    { group: "Charging / Maint", value: 3 },
    { group: "Off-Duty", value: 5 },
  ];

  const meterChartData = [
    { group: "Compliance Rate", value: 88 },
  ];

  const comboChartData = [
    { date: "Mon", orders: 120, compliance: 92 },
    { date: "Tue", orders: 140, compliance: 95 },
    { date: "Wed", orders: 180, compliance: 88 },
    { date: "Thu", orders: 160, compliance: 90 },
    { date: "Fri", orders: 210, compliance: 96 },
  ];

  return (
    <div className="min-h-screen bg-[var(--cds-background)] text-[var(--cds-text-primary)] p-[24px] space-y-[24px]">
      {/* Master Lab Header */}
      <PageHeader
        eyebrow="IBM Carbon Design System × MOVA"
        title="Design System Laboratory"
        subtitle="Single-source-of-truth canonical verification environment for Foundations, Components, Carbon Patterns, MOVA Patterns, Motion, and Accessibility."
        statusTag={{ label: `Carbon ${carbonTheme.toUpperCase()}`, type: theme === "dark" ? "purple" : "blue" }}
        actions={
          <div className="flex items-center gap-[8px]">
            <Button
              kind={theme === "dark" ? "secondary" : "tertiary"}
              size="md"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              Switch to {theme === "dark" ? "Light (White)" : "Dark (Gray 100)"}
            </Button>
            <Button
              kind="primary"
              size="md"
              renderIcon={Renew}
              onClick={() => {
                setMotionActive(true);
                setTimeout(() => setMotionActive(false), 800);
              }}
            >
              Trigger Motion Choreography
            </Button>
          </div>
        }
      />

      {/* Main Tab Navigation for 7 Lab Modules */}
      <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
        <TabList aria-label="Design System Lab Modules" contained>
          <Tab>01 Foundations</Tab>
          <Tab>02 Components</Tab>
          <Tab>03 Data Visualization</Tab>
          <Tab>04 Carbon Patterns</Tab>
          <Tab>05 MOVA Patterns</Tab>
          <Tab>06 Motion & Interaction</Tab>
          <Tab>07 Accessibility</Tab>
        </TabList>

        <TabPanels className="mt-[24px]">
          {/* ============================================================ */}
          {/* TAB 01: FOUNDATIONS */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[32px]">
              {/* Colors & Elevation Layers */}
              <section className="space-y-[16px]">
                <h3 className="text-[20px] font-semibold">1.1 Carbon Color Layers & Tokens</h3>
                <Grid fullWidth>
                  <Row className="gap-y-[16px]">
                    <Column lg={4} md={4} sm={4}>
                      <Tile className="bg-[var(--cds-background)] border border-[var(--cds-border-subtle)] p-[16px]">
                        <span className="text-[12px] text-[var(--cds-text-secondary)] font-mono">--cds-background</span>
                        <div className="text-[16px] font-semibold mt-1">Base Canvas</div>
                      </Tile>
                    </Column>
                    <Column lg={4} md={4} sm={4}>
                      <Tile className="bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] p-[16px]">
                        <span className="text-[12px] text-[var(--cds-text-secondary)] font-mono">--cds-layer-01</span>
                        <div className="text-[16px] font-semibold mt-1">Layer 01 (Panels)</div>
                      </Tile>
                    </Column>
                    <Column lg={4} md={4} sm={4}>
                      <Tile className="bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] p-[16px]">
                        <span className="text-[12px] text-[var(--cds-text-secondary)] font-mono">--cds-layer-02</span>
                        <div className="text-[16px] font-semibold mt-1">Layer 02 (Cards)</div>
                      </Tile>
                    </Column>
                    <Column lg={4} md={4} sm={4}>
                      <Tile className="bg-[var(--cds-layer-03)] border border-[var(--cds-border-subtle)] p-[16px]">
                        <span className="text-[12px] text-[var(--cds-text-secondary)] font-mono">--cds-layer-03</span>
                        <div className="text-[16px] font-semibold mt-1">Layer 03 (Popovers)</div>
                      </Tile>
                    </Column>
                  </Row>
                </Grid>
              </section>

              {/* Typography Scale */}
              <section className="space-y-[16px]">
                <h3 className="text-[20px] font-semibold">1.2 Carbon Typography Scale (IBM Plex)</h3>
                <div className="bg-[var(--cds-layer-01)] p-[20px] border border-[var(--cds-border-subtle)] space-y-[12px]">
                  <div className="flex items-center justify-between border-b border-[var(--cds-border-subtle)] pb-2">
                    <span className="text-[28px] font-semibold">heading-04 (28px / SemiBold)</span>
                    <code className="text-[12px] text-[var(--cds-text-secondary)]">28px / 36px</code>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--cds-border-subtle)] pb-2">
                    <span className="text-[20px]">heading-03 (20px / Regular)</span>
                    <code className="text-[12px] text-[var(--cds-text-secondary)]">20px / 26px</code>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--cds-border-subtle)] pb-2">
                    <span className="text-[16px] font-semibold">heading-02 (16px / SemiBold)</span>
                    <code className="text-[12px] text-[var(--cds-text-secondary)]">16px / 22px</code>
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--cds-border-subtle)] pb-2">
                    <span className="text-[14px]">body-compact-01 (14px / Regular)</span>
                    <code className="text-[12px] text-[var(--cds-text-secondary)]">14px / 18px</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-[var(--cds-text-secondary)]">label-01 (12px / Monospace & Sans)</span>
                    <code className="text-[12px] text-[var(--cds-text-secondary)]">12px / 16px</code>
                  </div>
                </div>
              </section>

              {/* 2x Grid Layout System */}
              <section className="space-y-[16px]">
                <h3 className="text-[20px] font-semibold">1.3 Carbon 2x 16-Column Grid System</h3>
                <Grid fullWidth>
                  <Row className="gap-y-[8px]">
                    <Column lg={4} md={2} sm={4}>
                      <div className="bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] p-3 text-center text-[12px]">
                        lg=4 / md=2 / sm=4
                      </div>
                    </Column>
                    <Column lg={4} md={2} sm={4}>
                      <div className="bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] p-3 text-center text-[12px]">
                        lg=4 / md=2 / sm=4
                      </div>
                    </Column>
                    <Column lg={4} md={2} sm={4}>
                      <div className="bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] p-3 text-center text-[12px]">
                        lg=4 / md=2 / sm=4
                      </div>
                    </Column>
                    <Column lg={4} md={2} sm={4}>
                      <div className="bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] p-3 text-center text-[12px]">
                        lg=4 / md=2 / sm=4
                      </div>
                    </Column>
                  </Row>
                </Grid>
              </section>
            </div>
          </TabPanel>

          {/* ============================================================ */}
          {/* TAB 02: COMPONENTS */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[32px]">
              {/* Buttons Hierarchy */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">2.1 Button Hierarchy & Actions</h3>
                <div className="flex flex-wrap items-center gap-[12px]">
                  <Button kind="primary" renderIcon={Add}>Primary Action</Button>
                  <Button kind="secondary" renderIcon={Renew}>Secondary Action</Button>
                  <Button kind="tertiary">Tertiary Action</Button>
                  <Button kind="ghost" renderIcon={Settings}>Ghost Action</Button>
                  <Button kind="danger" renderIcon={TrashCan}>Danger Action</Button>
                  <Button kind="primary" disabled>Disabled State</Button>
                </div>
              </section>

              {/* Form Controls */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">2.2 Form Controls & Inputs</h3>
                <Grid fullWidth>
                  <Row className="gap-y-[16px]">
                    <Column lg={8} md={4} sm={4}>
                      <TextInput id="test-text" labelText="Fleet Identifier" placeholder="e.g. ARM-SDA-09" helperText="Unique hardware tag ID" />
                    </Column>
                    <Column lg={8} md={4} sm={4}>
                      <PasswordInput id="test-pass" labelText="Security Passcode" placeholder="Enter password" />
                    </Column>
                    <Column lg={8} md={4} sm={4}>
                      <Select id="test-select" labelText="Zone Assignment">
                        <SelectItem value="z1" text="Alun-Alun Sidoarjo Hub" />
                        <SelectItem value="z2" text="Kawasan Gedangan" />
                        <SelectItem value="z3" text="Krian Logistics" />
                      </Select>
                    </Column>
                    <Column lg={8} md={4} sm={4}>
                      <div className="flex items-center gap-[24px] pt-[24px]">
                        <Checkbox id="chk-1" labelText="Active Telemetry" defaultChecked />
                        <Toggle id="tgl-1" labelA="Off" labelB="Live" defaultToggled labelText="Live GPS Feed" />
                      </div>
                    </Column>
                  </Row>
                </Grid>
              </section>

              {/* Status Tags & Feedback */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">2.3 Status Tags & Notifications</h3>
                <div className="flex flex-wrap items-center gap-[8px]">
                  <Tag type="green">ACTIVE / COMPLIANT</Tag>
                  <Tag type="yellow">ATTENTION / WARNING</Tag>
                  <Tag type="red">DEVIATED / CRITICAL</Tag>
                  <Tag type="blue">IN TRANSIT</Tag>
                  <Tag type="purple">DSS OPTIMIZED</Tag>
                  <Tag type="gray">STANDBY</Tag>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] pt-[8px]">
                  <InlineNotification
                    kind="info"
                    title="Real-time Dispatch Active:"
                    subtitle="Zone geofencing telemetry synchronized with Sidoarjo sub-hub."
                    hideCloseButton
                  />
                  <InlineNotification
                    kind="warning"
                    title="Battery Warning:"
                    subtitle="2 riders reporting battery levels below 20% in Gedangan."
                    hideCloseButton
                  />
                </div>
              </section>

              {/* Surfaces & Accordion */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">2.4 Surfaces & Expandable Tiles</h3>
                <Grid fullWidth>
                  <Row className="gap-y-[16px]">
                    <Column lg={8} md={4} sm={4}>
                      <ExpandableTile tileCollapsedIconText="Expand" tileExpandedIconText="Collapse">
                        <div className="font-semibold text-[16px]">Expandable Operational Metadata</div>
                        <p className="cds-body-compact-01 text-[var(--cds-text-secondary)] mt-1">
                          Click to inspect underlying MQTT telemetry topics and socket buffers.
                        </p>
                      </ExpandableTile>
                    </Column>
                    <Column lg={8} md={4} sm={4}>
                      <Accordion>
                        <AccordionItem title="Decision Support System (BWM Criteria Weighting)">
                          <p className="cds-body-compact-01 text-[var(--cds-text-secondary)]">
                            Best-Worst Method applies pairwise matrix vectors across Distance, Demand Density, Road Quality, and Battery Margin.
                          </p>
                        </AccordionItem>
                      </Accordion>
                    </Column>
                  </Row>
                </Grid>
              </section>
            </div>
          </TabPanel>

          {/* ============================================================ */}
          {/* TAB 03: DATA VISUALIZATION (CHARTS) */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[32px]">
              <div className="border-b border-[var(--cds-border-subtle)] pb-[12px]">
                <h3 className="text-[20px] font-semibold">IBM Carbon Data Visualization Suite</h3>
                <p className="cds-body-compact-01 text-[var(--cds-text-secondary)]">
                  Native Carbon Charts with dynamic multi-theme support (Dark Gray 100 / Light White).
                </p>
              </div>

              <Grid fullWidth>
                <Row className="gap-y-[24px]">
                  <Column lg={8} md={4} sm={4}>
                    <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                      <CarbonBarChart
                        data={barChartData}
                        options={{ title: "Daily Orders by Operational Zone", yAxisTitle: "Orders" }}
                      />
                    </Tile>
                  </Column>

                  <Column lg={8} md={4} sm={4}>
                    <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                      <CarbonLineChart
                        data={lineChartData}
                        options={{ title: "Hourly Active Rider Density", yAxisTitle: "Riders" }}
                      />
                    </Tile>
                  </Column>

                  <Column lg={8} md={4} sm={4}>
                    <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                      <CarbonDonutChart
                        data={donutChartData}
                        options={{ title: "Fleet Telemetry Status Allocation", centerLabel: "32 Armadas" }}
                      />
                    </Tile>
                  </Column>

                  <Column lg={8} md={4} sm={4}>
                    <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                      <CarbonMeterChart
                        data={meterChartData}
                        options={{ title: "Zone Geofencing Compliance SLA Rate", peak: 100 }}
                      />
                    </Tile>
                  </Column>

                  <Column lg={16} md={8} sm={4}>
                    <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                      <CarbonComboChart
                        data={comboChartData}
                        options={{ title: "Order Volume vs SLA Compliance Correlation", yAxisTitle: "Orders", rightYAxisTitle: "Compliance %" }}
                      />
                    </Tile>
                  </Column>
                </Row>
              </Grid>
            </div>
          </TabPanel>

          {/* ============================================================ */}
          {/* TAB 04: CARBON PATTERNS */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[32px]">
              {/* Pattern: Filter Bar */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">4.1 Standard FilterBar Pattern</h3>
                <FilterBar
                  searchValue={searchFilter}
                  onSearchChange={setSearchFilter}
                  searchPlaceholder="Search zones or riders..."
                  onReset={() => setSearchFilter("")}
                  showApplyButton
                  onApply={() => {}}
                >
                  <div className="w-[180px]">
                    <Select id="filter-status" labelText="Status" size="md" inline>
                      <SelectItem value="all" text="All Statuses" />
                      <SelectItem value="active" text="Active Only" />
                      <SelectItem value="warning" text="Warning Only" />
                    </Select>
                  </div>
                </FilterBar>
              </section>

              {/* Pattern: Full Native Carbon DataTable */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">4.2 Operational DataTable with Batch Actions & Pagination</h3>
                <OperationalDataTable
                  title="Operational Zones Management"
                  description="Real-time geofence parameters and rider assignment status."
                  headers={tableHeaders}
                  rows={tableRows}
                  batchActions={[
                    { id: "activate", label: "Bulk Activate", icon: Renew },
                    { id: "delete", label: "Delete Selected", icon: TrashCan },
                  ]}
                  onBatchAction={(action, selected) => {
                    setIsConfirmOpen(true);
                  }}
                  toolbarActions={[
                    { label: "Refresh Data", icon: Renew, onClick: () => {} },
                  ]}
                />
              </section>

              {/* Pattern: Empty State */}
              <section className="space-y-[12px]">
                <h3 className="text-[20px] font-semibold">4.3 Empty State Pattern</h3>
                <EmptyStatePattern
                  title="No Deviated Armadas"
                  description="All active riders are currently operating within their designated polygon boundaries."
                  actionLabel="View Fleet Operations"
                  onAction={() => {}}
                />
              </section>
            </div>
          </TabPanel>

          {/* ============================================================ */}
          {/* TAB 05: MOVA PATTERNS */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[24px]">
              <div className="border-b border-[var(--cds-border-subtle)] pb-[12px]">
                <h3 className="text-[20px] font-semibold">MOVA Domain-Specific Pattern Compositions</h3>
                <p className="cds-body-compact-01 text-[var(--cds-text-secondary)]">
                  Operational architectures built purely with Carbon primitives to resolve complex logistics & GIS challenges.
                </p>
              </div>

              {/* MOVA Pattern 1: Map Operations Master-Detail */}
              <Tile className="p-[20px] bg-[var(--cds-layer-01)] space-y-[16px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[18px] font-semibold flex items-center gap-2">
                      <Map size={20} /> MOVA Map Operations Master-Detail Composition
                    </h4>
                    <p className="text-[14px] text-[var(--cds-text-secondary)] mt-1">
                      Split-screen layout: Leaflet GIS Canvas on left + Carbon MasterDetailPanel on right.
                    </p>
                  </div>
                  <Button
                    kind="primary"
                    size="md"
                    renderIcon={View}
                    onClick={() => {
                      setSelectedRecord({ name: "Alun-Alun Sidoarjo Hub", code: "Z-SDA-01", riders: 4, compliance: "94.5%" });
                      setIsDetailOpen(true);
                    }}
                  >
                    Open Inspection Panel
                  </Button>
                </div>

                <div className="h-[280px] bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] flex items-center justify-center relative overflow-hidden">
                  <div className="text-center space-y-2">
                    <Location size={32} className="mx-auto text-[var(--cds-interactive)] animate-bounce" />
                    <div className="font-semibold">Interactive GIS Simulation Canvas</div>
                    <div className="text-[12px] text-[var(--cds-text-secondary)]">Polygon Geofences: 5 Zones | Active Telemetry: 18 Nodes</div>
                  </div>
                </div>
              </Tile>
            </div>
          </TabPanel>

          {/* ============================================================ */}
          {/* TAB 06: MOTION & INTERACTION */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[24px]">
              <h3 className="text-[20px] font-semibold">IBM Carbon Motion Easing & Choreography</h3>
              <p className="cds-body-compact-01 text-[var(--cds-text-secondary)]">
                Carbon Productive Curve (<code className="font-mono text-[12px]">cubic-bezier(0.2, 0, 0.38, 0.9)</code>) and Expressive Curve for natural enterprise feedback.
              </p>

              <Grid fullWidth>
                <Row className="gap-y-[16px]">
                  <Column lg={8} md={4} sm={4}>
                    <div className={`p-[20px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] ${motionActive ? "cds-motion-slide-in-up" : ""}`}>
                      <h4 className="font-semibold">Productive Entrance (240ms)</h4>
                      <p className="text-[14px] text-[var(--cds-text-secondary)] mt-1">
                        Applied to modal entries, side-drawer sliding, and dropdown expansions.
                      </p>
                    </div>
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <div className={`p-[20px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] ${motionActive ? "cds-motion-fade-in" : ""}`}>
                      <h4 className="font-semibold">Micro-Interaction Transition (70ms)</h4>
                      <p className="text-[14px] text-[var(--cds-text-secondary)] mt-1">
                        Instant focus indicators, hover elevation, and tag status changes.
                      </p>
                    </div>
                  </Column>
                </Row>
              </Grid>
            </div>
          </TabPanel>

          {/* ============================================================ */}
          {/* TAB 07: ACCESSIBILITY */}
          {/* ============================================================ */}
          <TabPanel>
            <div className="space-y-[24px]">
              <h3 className="text-[20px] font-semibold">Enterprise Accessibility & Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                  <div className="flex items-center gap-2 font-semibold text-[16px]">
                    <CheckmarkOutline className="text-[var(--cds-support-success)]" /> High-Contrast Ratios
                  </div>
                  <p className="text-[14px] text-[var(--cds-text-secondary)] mt-2">
                    WCAG 2.1 AA Compliant (Minimum 4.5:1 text contrast on Gray 100/White).
                  </p>
                </Tile>

                <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                  <div className="flex items-center gap-2 font-semibold text-[16px]">
                    <CheckmarkOutline className="text-[var(--cds-support-success)]" /> Keyboard Navigation
                  </div>
                  <p className="text-[14px] text-[var(--cds-text-secondary)] mt-2">
                    Full TabIndex sequence, 2px focus ring offsets, and accessible ARIA attributes.
                  </p>
                </Tile>

                <Tile className="p-[16px] bg-[var(--cds-layer-01)]">
                  <div className="flex items-center gap-2 font-semibold text-[16px]">
                    <CheckmarkOutline className="text-[var(--cds-support-success)]" /> Reduced Motion Support
                  </div>
                  <p className="text-[14px] text-[var(--cds-text-secondary)] mt-2">
                    Media query <code className="font-mono text-[12px]">prefers-reduced-motion</code> disables non-essential animations.
                  </p>
                </Tile>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        danger
        title="Confirm Batch Zone Action"
        description="Are you sure you want to perform this batch action on the selected operational entities?"
        onConfirm={() => setIsConfirmOpen(false)}
        onClose={() => setIsConfirmOpen(false)}
      />

      {/* Master Detail Side Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 pointer-events-none">
        {isDetailOpen && (
          <div className="pointer-events-auto h-full">
            <MasterDetailPanel
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
              title={selectedRecord?.name || "Zone Detail"}
              subtitle={selectedRecord?.code || "Operational Code"}
              footer={
                <div className="flex items-center justify-end gap-2">
                  <Button kind="secondary" size="md" onClick={() => setIsDetailOpen(false)}>Close</Button>
                  <Button kind="primary" size="md">Modify Geofence</Button>
                </div>
              }
            >
              <div className="space-y-[16px]">
                <div className="p-3 bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] space-y-1">
                  <div className="text-[12px] text-[var(--cds-text-secondary)]">Active Dispatch Load</div>
                  <div className="text-[20px] font-semibold">{selectedRecord?.riders}</div>
                </div>
                <div className="p-3 bg-[var(--cds-layer-02)] border border-[var(--cds-border-subtle)] space-y-1">
                  <div className="text-[12px] text-[var(--cds-text-secondary)]">Geofence Compliance SLA</div>
                  <div className="text-[20px] font-semibold text-[var(--cds-support-success)]">{selectedRecord?.compliance}</div>
                </div>
              </div>
            </MasterDetailPanel>
          </div>
        )}
      </div>
    </div>
  );
}
