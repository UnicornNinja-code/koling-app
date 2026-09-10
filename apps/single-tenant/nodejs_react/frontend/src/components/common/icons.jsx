import React from "react";

/**
 * Boxicons Bridge Adapter for MOVA Single-Tenant
 * Replaces Lucide icons with authentic Boxicons from assets/boxicons-free.
 */

export function createBoxIcon(bxClass) {
  const Component = React.forwardRef(function BoxIconBridge(
    { className = "", size, color, strokeWidth, ...props },
    ref
  ) {
    return (
      <i
        ref={ref}
        className={`bx ${bxClass} inline-flex items-center justify-center ${className}`}
        style={color ? { color } : undefined}
        aria-hidden="true"
        {...props}
      />
    );
  });
  Component.displayName = `BoxIcon(${bxClass})`;
  return Component;
}

// Comprehensive mapping for all icons across MOVA Single-Tenant
export const Activity = createBoxIcon("bx-pulse");
export const AlertCircle = createBoxIcon("bx-error-circle");
export const AlertTriangle = createBoxIcon("bx-error-alt");
export const ArrowDown = createBoxIcon("bx-down-arrow-alt");
export const ArrowLeft = createBoxIcon("bx-left-arrow-alt");
export const ArrowRight = createBoxIcon("bx-right-arrow-alt");
export const ArrowUp = createBoxIcon("bx-up-arrow-alt");
export const Award = createBoxIcon("bx-award");
export const BarChart3 = createBoxIcon("bx-bar-chart-alt-2");
export const Battery = createBoxIcon("bx-battery");
export const Bell = createBoxIcon("bx-bell");
export const Bike = createBoxIcon("bx-cycling");
export const BrainCircuit = createBoxIcon("bx-brain");
export const Briefcase = createBoxIcon("bx-briefcase");
export const Building = createBoxIcon("bx-building");
export const Building2 = createBoxIcon("bx-building-house");
export const Calendar = createBoxIcon("bx-calendar");
export const CalendarCheck = createBoxIcon("bx-calendar-check");
export const Check = createBoxIcon("bx-check");
export const CheckCircle = createBoxIcon("bx-check-circle");
export const CheckCircle2 = createBoxIcon("bx-check-circle");
export const ChevronDown = createBoxIcon("bx-chevron-down");
export const ChevronLeft = createBoxIcon("bx-chevron-left");
export const ChevronRight = createBoxIcon("bx-chevron-right");
export const ChevronUp = createBoxIcon("bx-chevron-up");
export const Circle = createBoxIcon("bx-circle");
export const CircleCheck = createBoxIcon("bx-check-circle");
export const CircleX = createBoxIcon("bx-x-circle");
export const Clock = createBoxIcon("bx-time-five");
export const Cloud = createBoxIcon("bx-cloud");
export const CloudDownload = createBoxIcon("bx-cloud-download");
export const CloudDrizzle = createBoxIcon("bx-cloud-drizzle");
export const CloudLightning = createBoxIcon("bx-cloud-lightning");
export const CloudRain = createBoxIcon("bx-cloud-rain");
export const CloudSun = createBoxIcon("bx-cloud-sun");
export const Coffee = createBoxIcon("bx-coffee");
export const Coins = createBoxIcon("bx-coins");
export const Compass = createBoxIcon("bx-compass");
export const Copy = createBoxIcon("bx-copy");
export const Cpu = createBoxIcon("bx-chip");
export const Crosshair = createBoxIcon("bx-crosshair");
export const Database = createBoxIcon("bx-data");
export const DollarSign = createBoxIcon("bx-dollar");
export const Download = createBoxIcon("bx-download");
export const Droplets = createBoxIcon("bx-water");
export const Edit = createBoxIcon("bx-edit");
export const Edit2 = createBoxIcon("bx-edit-alt");
export const Eye = createBoxIcon("bx-show");
export const EyeOff = createBoxIcon("bx-hide");
export const FileCheck = createBoxIcon("bx-file-check");
export const FileQuestion = createBoxIcon("bx-file");
export const FileSpreadsheet = createBoxIcon("bx-file");
export const FileText = createBoxIcon("bx-file");
export const Filter = createBoxIcon("bx-filter");
export const Flame = createBoxIcon("bx-flame");
export const HelpCircle = createBoxIcon("bx-help-circle");
export const History = createBoxIcon("bx-history");
export const Home = createBoxIcon("bx-home");
export const Inbox = createBoxIcon("bx-inbox");
export const Info = createBoxIcon("bx-info-circle");
export const Key = createBoxIcon("bx-key");
export const KeyRound = createBoxIcon("bx-key");
export const Layers = createBoxIcon("bx-layer");
export const LayoutDashboard = createBoxIcon("bx-grid-alt");
export const ListFilter = createBoxIcon("bx-filter-alt");
export const Loader2 = createBoxIcon("bx-loader-alt animate-spin");
export const Lock = createBoxIcon("bx-lock-alt");
export const LogOut = createBoxIcon("bx-log-out");
export const Mail = createBoxIcon("bx-envelope");
export const MapPin = createBoxIcon("bx-map-pin");
export const Menu = createBoxIcon("bx-menu");
export const MessageSquare = createBoxIcon("bx-message-dots");
export const Minus = createBoxIcon("bx-minus");
export const Moon = createBoxIcon("bx-moon");
export const MoreHorizontal = createBoxIcon("bx-dots-horizontal-rounded");
export const MoreVertical = createBoxIcon("bx-dots-vertical-rounded");
export const Navigation = createBoxIcon("bx-navigation");
export const Package = createBoxIcon("bx-package");
export const Phone = createBoxIcon("bx-phone");
export const PieChart = createBoxIcon("bx-pie-chart-alt-2");
export const Play = createBoxIcon("bx-play");
export const Plus = createBoxIcon("bx-plus");
export const Power = createBoxIcon("bx-power-off");
export const Printer = createBoxIcon("bx-printer");
export const Radio = createBoxIcon("bx-radio");
export const RefreshCw = createBoxIcon("bx-refresh");
export const RotateCcw = createBoxIcon("bx-rotate-left");
export const RotateCw = createBoxIcon("bx-rotate-right");
export const Save = createBoxIcon("bx-save");
export const Scale = createBoxIcon("bx-analyse");
export const Search = createBoxIcon("bx-search");
export const Send = createBoxIcon("bx-send");
export const Settings = createBoxIcon("bx-cog");
export const Shield = createBoxIcon("bx-shield");
export const ShieldAlert = createBoxIcon("bx-shield-quarter");
export const ShieldCheck = createBoxIcon("bx-shield-check");
export const ShoppingBag = createBoxIcon("bx-shopping-bag");
export const Sliders = createBoxIcon("bx-slider");
export const SlidersHorizontal = createBoxIcon("bx-slider-alt");
export const Sparkles = createBoxIcon("bx-sparkles");
export const SquarePen = createBoxIcon("bx-edit");
export const Store = createBoxIcon("bx-store-alt");
export const Sun = createBoxIcon("bx-sun");
export const SunDim = createBoxIcon("bx-sun");
export const Sunset = createBoxIcon("bx-sunset");
export const Tag = createBoxIcon("bx-tag");
export const Target = createBoxIcon("bx-target-lock");
export const Thermometer = createBoxIcon("bx-thermometer");
export const Trash2 = createBoxIcon("bx-trash");
export const TrendingDown = createBoxIcon("bx-trending-down");
export const TrendingUp = createBoxIcon("bx-trending-up");
export const TriangleAlert = createBoxIcon("bx-error-alt");
export const Upload = createBoxIcon("bx-upload");
export const User = createBoxIcon("bx-user");
export const UserCheck = createBoxIcon("bx-user-check");
export const UserCog = createBoxIcon("bx-user-pin");
export const UserPlus = createBoxIcon("bx-user-plus");
export const Users = createBoxIcon("bx-group");
export const UserX = createBoxIcon("bx-user-x");
export const BellRing = createBoxIcon("bx-bell-plus");
export const ExternalLink = createBoxIcon("bx-link-external");
export const FolderSync = createBoxIcon("bx-sync");
export const LayoutGrid = createBoxIcon("bx-grid-alt");
export const MousePointerClick = createBoxIcon("bx-pointer");
export const Table2 = createBoxIcon("bx-table");
export const Truck = createBoxIcon("bx-car");
export const Wind = createBoxIcon("bx-wind");
export const X = createBoxIcon("bx-x");
export const XCircle = createBoxIcon("bx-x-circle");

export default {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  Battery,
  Bell,
  Bike,
  BrainCircuit,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleCheck,
  CircleX,
  Clock,
  Cloud,
  CloudDownload,
  CloudRain,
  CloudSun,
  Coffee,
  Coins,
  Compass,
  Copy,
  Crosshair,
  Database,
  DollarSign,
  Download,
  Droplets,
  Edit,
  Edit2,
  Eye,
  EyeOff,
  FileCheck,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  HelpCircle,
  History,
  Home,
  Inbox,
  Info,
  Key,
  KeyRound,
  Layers,
  LayoutDashboard,
  ListFilter,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Navigation,
  Package,
  Phone,
  PieChart,
  Play,
  Plus,
  Power,
  Radio,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Save,
  Scale,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  Store,
  Sun,
  SunDim,
  Sunset,
  Tag,
  Target,
  Thermometer,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Upload,
  User,
  UserCheck,
  UserCog,
  BellRing,
  ExternalLink,
  FolderSync,
  LayoutGrid,
  MousePointerClick,
  Table2,
  Truck,
  UserX,
  Wind,
  X,
  XCircle,
};
