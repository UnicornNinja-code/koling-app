import React from "react";

/**
 * Google Material Symbols Outlined Adapter for MOVA Single-Tenant
 * Uses pure Outlined style ('FILL' 0) with zero rounded/sharp distortion.
 * Reference: MOVA Design System v3.0 & assets/img/
 */

export function createMaterialIcon(iconName) {
  const Component = React.forwardRef(function MaterialIconBridge(
    { className = "", size, color, strokeWidth, style, ...props },
    ref
  ) {
    const computedStyle = {
      ...(color ? { color } : {}),
      ...(size ? { fontSize: typeof size === "number" ? `${size}px` : size, width: size, height: size } : {}),
      ...style,
    };

    return (
      <span
        ref={ref}
        className={`material-symbols-outlined leading-none select-none inline-flex items-center justify-center shrink-0 ${className}`}
        style={computedStyle}
        aria-hidden="true"
        {...props}
      >
        {iconName}
      </span>
    );
  });
  Component.displayName = `MaterialIcon(${iconName})`;
  return Component;
}

// Backward compatibility alias for legacy bridges
export const createGoogleIcon = createMaterialIcon;
export const createBoxIcon = createMaterialIcon;

// ============================================================================
// Comprehensive Google Material Symbols (Outlined) Mapping
// ============================================================================
export const Activity = createMaterialIcon("monitoring");
export const AlertCircle = createMaterialIcon("error");
export const AlertTriangle = createMaterialIcon("warning");
export const ArrowDown = createMaterialIcon("arrow_downward");
export const ArrowLeft = createMaterialIcon("arrow_back");
export const ArrowRight = createMaterialIcon("arrow_forward");
export const ArrowUp = createMaterialIcon("arrow_upward");
export const Award = createMaterialIcon("award_star");
export const BarChart3 = createMaterialIcon("bar_chart");
export const Battery = createMaterialIcon("battery_full");
export const BatteryCharging = createMaterialIcon("battery_charging_full");
export const BatteryMedium = createMaterialIcon("battery_5_bar");
export const BatteryWarning = createMaterialIcon("battery_alert");
export const Bell = createMaterialIcon("notifications");
export const BellRing = createMaterialIcon("notifications_active");
export const Bike = createMaterialIcon("two_wheeler");
export const BrainCircuit = createMaterialIcon("psychology");
export const Briefcase = createMaterialIcon("work");
export const Building = createMaterialIcon("apartment");
export const Building2 = createMaterialIcon("domain");
export const Calendar = createMaterialIcon("calendar_today");
export const CalendarCheck = createMaterialIcon("event_available");
export const Check = createMaterialIcon("check");
export const CheckCircle = createMaterialIcon("check_circle");
export const CheckCircle2 = createMaterialIcon("check_circle");
export const ChevronDown = createMaterialIcon("expand_more");
export const ChevronLeft = createMaterialIcon("chevron_left");
export const ChevronRight = createMaterialIcon("chevron_right");
export const ChevronUp = createMaterialIcon("expand_less");
export const Circle = createMaterialIcon("circle");
export const CircleCheck = createMaterialIcon("check_circle");
export const CircleX = createMaterialIcon("cancel");
export const Clock = createMaterialIcon("schedule");
export const Cloud = createMaterialIcon("cloud");
export const CloudDownload = createMaterialIcon("cloud_download");
export const CloudDrizzle = createMaterialIcon("rainy");
export const CloudLightning = createMaterialIcon("thunderstorm");
export const CloudRain = createMaterialIcon("rainy");
export const CloudSun = createMaterialIcon("partly_cloudy_day");
export const Coffee = createMaterialIcon("local_cafe");
export const Coins = createMaterialIcon("payments");
export const Compass = createMaterialIcon("explore");
export const Copy = createMaterialIcon("content_copy");
export const Cpu = createMaterialIcon("memory");
export const Crosshair = createMaterialIcon("my_location");
export const Database = createMaterialIcon("database");
export const DollarSign = createMaterialIcon("attach_money");
export const Download = createMaterialIcon("download");
export const Droplets = createMaterialIcon("water_drop");
export const Edit = createMaterialIcon("edit");
export const Edit2 = createMaterialIcon("edit");
export const ExternalLink = createMaterialIcon("open_in_new");
export const Eye = createMaterialIcon("visibility");
export const EyeOff = createMaterialIcon("visibility_off");
export const FileCheck = createMaterialIcon("fact_check");
export const FileQuestion = createMaterialIcon("help_outline");
export const FileSpreadsheet = createMaterialIcon("table_view");
export const FileText = createMaterialIcon("description");
export const Filter = createMaterialIcon("filter_list");
export const Flame = createMaterialIcon("local_fire_department");
export const Globe = createMaterialIcon("public");
export const FolderSync = createMaterialIcon("sync");
export const Gauge = createMaterialIcon("speed");
export const HelpCircle = createMaterialIcon("help");
export const History = createMaterialIcon("history");
export const Home = createMaterialIcon("home");
export const Inbox = createMaterialIcon("inbox");
export const Info = createMaterialIcon("info");
export const Key = createMaterialIcon("key");
export const KeyRound = createMaterialIcon("key");
export const Layers = createMaterialIcon("layers");
export const LayoutDashboard = createMaterialIcon("dashboard");
export const LayoutGrid = createMaterialIcon("grid_view");
export const ListFilter = createMaterialIcon("filter_alt");
export const Loader2 = createMaterialIcon("progress_activity");
export const Lock = createMaterialIcon("lock");
export const LogOut = createMaterialIcon("logout");
export const Mail = createMaterialIcon("mail");
export const MapPin = createMaterialIcon("location_on");
export const Menu = createMaterialIcon("menu");
export const MessageSquare = createMaterialIcon("chat");
export const Minus = createMaterialIcon("remove");
export const Moon = createMaterialIcon("dark_mode");
export const MoreHorizontal = createMaterialIcon("more_horiz");
export const MoreVertical = createMaterialIcon("more_vert");
export const MousePointerClick = createMaterialIcon("ads_click");
export const Navigation = createMaterialIcon("near_me");
export const Package = createMaterialIcon("inventory_2");
export const Phone = createMaterialIcon("call");
export const PieChart = createMaterialIcon("pie_chart");
export const Play = createMaterialIcon("play_arrow");
export const Plus = createMaterialIcon("add");
export const Power = createMaterialIcon("power_settings_new");
export const Printer = createMaterialIcon("print");
export const Radio = createMaterialIcon("radio_button_checked");
export const RefreshCw = createMaterialIcon("refresh");
export const RotateCcw = createMaterialIcon("rotate_left");
export const RotateCw = createMaterialIcon("rotate_right");
export const Save = createMaterialIcon("save");
export const Scale = createMaterialIcon("balance");
export const Search = createMaterialIcon("search");
export const Send = createMaterialIcon("send");
export const Settings = createMaterialIcon("settings");
export const Shield = createMaterialIcon("shield");
export const ShieldAlert = createMaterialIcon("shield");
export const ShieldCheck = createMaterialIcon("verified_user");
export const ShoppingBag = createMaterialIcon("shopping_bag");
export const Sliders = createMaterialIcon("tune");
export const SlidersHorizontal = createMaterialIcon("tune");
export const Sparkles = createMaterialIcon("auto_awesome");
export const SquarePen = createMaterialIcon("edit");
export const Store = createMaterialIcon("storefront");
export const Sun = createMaterialIcon("light_mode");
export const SunDim = createMaterialIcon("light_mode");
export const Sunset = createMaterialIcon("wb_twilight");
export const Table2 = createMaterialIcon("table_chart");
export const Tag = createMaterialIcon("sell");
export const Target = createMaterialIcon("track_changes");
export const Thermometer = createMaterialIcon("device_thermostat");
export const Trash2 = createMaterialIcon("delete");
export const TrendingDown = createMaterialIcon("trending_down");
export const TrendingUp = createMaterialIcon("trending_up");
export const TriangleAlert = createMaterialIcon("warning");
export const Trophy = createMaterialIcon("trophy");
export const Truck = createMaterialIcon("local_shipping");
export const Upload = createMaterialIcon("upload");
export const User = createMaterialIcon("person");
export const UserCheck = createMaterialIcon("how_to_reg");
export const UserCog = createMaterialIcon("manage_accounts");
export const UserPlus = createMaterialIcon("person_add");
export const Users = createMaterialIcon("group");
export const UserX = createMaterialIcon("person_off");
export const Wind = createMaterialIcon("air");
export const Wrench = createMaterialIcon("build");
export const X = createMaterialIcon("close");
export const XCircle = createMaterialIcon("cancel");
export const Zap = createMaterialIcon("bolt");


// ============================================================================
// Custom MOVA Operational Vehicle Icons (Gerobak Kopi & Motor Listrik)
// ============================================================================
export const GerobakKopiIcon = React.forwardRef(function GerobakKopiIcon(
  { className = "w-5 h-5", size = 20, color = "currentColor", ...props },
  ref
) {
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 inline-block ${className}`}
      {...props}
    >
      {/* Canopy / Awning */}
      <path d="M3 8h18l-1.5-4h-15L3 8z" />
      <path d="M3 8c0 1 1 2 2.25 2S7.5 9 7.5 8c0 1 1 2 2.25 2S12 9 12 8c0 1 1 2 2.25 2S16.5 9 16.5 8c0 1 1 2 2.25 2S21 9 21 8" />
      {/* Cart Body */}
      <rect x="4" y="10" width="16" height="7" rx="1" />
      {/* Coffee Cup on Counter */}
      <path d="M14 6.5h3v2h-3z" />
      <path d="M17 7.5h1a.5.5 0 0 1 .5.5v0a.5.5 0 0 1-.5.5h-1" />
      {/* Cart Support & Handle */}
      <path d="M20 12h2" />
      {/* Wheels */}
      <circle cx="8" cy="19" r="2" />
      <circle cx="16" cy="19" r="2" />
      <path d="M10 19h4" />
    </svg>
  );
});
GerobakKopiIcon.displayName = "GerobakKopiIcon";
export const CoffeeCart = GerobakKopiIcon;
export const Gerobak = GerobakKopiIcon;

export const MotorListrikIcon = React.forwardRef(function MotorListrikIcon(
  { className = "w-5 h-5", size = 20, color = "currentColor", ...props },
  ref
) {
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 inline-block ${className}`}
      {...props}
    >
      {/* Wheels */}
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
      {/* Scooter Frame & Handlebar */}
      <path d="M19 18h-4l-3-7H8" />
      <path d="M12 11l-3 7H5" />
      <path d="M16 5l-4 6" />
      <path d="M14 5h4" />
      {/* Electric Bolt Accent on Battery Area */}
      <path d="M10.5 13.5l-1 2h1.5l-.5 2" strokeWidth="1.5" />
      {/* Seat */}
      <path d="M8 11h3" />
    </svg>
  );
});
MotorListrikIcon.displayName = "MotorListrikIcon";
export const ElectricMotorcycle = MotorListrikIcon;
export const MotorListrik = MotorListrikIcon;
export const ElectricScooter = MotorListrikIcon;

// Weather Environment Helpers
export const WeatherSun = createMaterialIcon("sunny");
export const WeatherCloudSun = createMaterialIcon("partly_cloudy_day");
export const WeatherRain = createMaterialIcon("rainy");
export const WeatherThunder = createMaterialIcon("thunderstorm");
export const Humidity = createMaterialIcon("water_drop");
export const WindSpeed = createMaterialIcon("air");
export const Visibility = createMaterialIcon("visibility");

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
  BatteryCharging,
  BatteryMedium,
  BatteryWarning,
  Bell,
  BellRing,
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
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSun,
  Coffee,
  Coins,
  Compass,
  Copy,
  Cpu,
  Crosshair,
  Database,
  DollarSign,
  Download,
  Droplets,
  Edit,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Globe,
  HelpCircle,
  Home,
  Info,
  Layers,
  LayoutDashboard,
  LayoutGrid,
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
  MousePointerClick,
  Navigation,
  Package,
  Phone,
  PieChart,
  Play,
  Plus,
  Power,
  Printer,
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
  Table2,
  Tag,
  Target,
  Thermometer,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Truck,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
  Wind,
  Wrench,
  X,
  XCircle,
  Zap,
  GerobakKopiIcon,
  MotorListrikIcon,
  CoffeeCart,
  MotorListrik,
  ElectricMotorcycle,
  WeatherSun,
  WeatherCloudSun,
  WeatherRain,
  Humidity,
  WindSpeed,
  Visibility,
};
