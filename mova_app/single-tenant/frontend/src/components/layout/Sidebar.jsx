import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react";
import {
  Dashboard,
  Map,
  Location,
  DeliveryTruck,
  PedestrianChild,
  Calculator,
  Search,
  Document,
  Product,
  Group,
  Settings,
} from "@carbon/icons-react";
import { useAuth } from "../../context/AuthContext.jsx";

export function Sidebar({ isExpanded = true, onCloseMobile }) {
  const { user } = useAuth();
  const location = useLocation();
  const userRole = String(user?.role || "GUEST").toUpperCase();

  // RBAC Navigation Access Definitions
  const isSuperadmin = userRole === "SUPERADMIN";
  const isManagement = userRole === "MANAGEMENT" || isSuperadmin;
  const isSupervisor = userRole === "SUPERVISOR" || isSuperadmin;
  const isRider = userRole === "RIDER";

  return (
    <SideNav
      isFixedNav
      expanded={isExpanded}
      isChildOfHeader={true}
      aria-label="MOVA Primary Navigation"
      className="cds-ui-shell-sidenav"
    >
      <SideNavItems>
        {/* Dashboard (Superadmin, Management, Supervisor) */}
        {!isRider && (
          <SideNavLink
            renderIcon={Dashboard}
            as={NavLink}
            to="/dashboard"
            isActive={location.pathname === "/dashboard"}
            onClick={onCloseMobile}
          >
            Dashboard
          </SideNavLink>
        )}

        {/* Rider Operational HUD (For Rider role or Superadmin) */}
        {(isRider || isSuperadmin) && (
          <SideNavLink
            renderIcon={PedestrianChild}
            as={NavLink}
            to="/operational-rider"
            isActive={location.pathname === "/operational-rider"}
            onClick={onCloseMobile}
          >
            Rider Operational HUD
          </SideNavLink>
        )}

        {/* Operations Section (Superadmin, Supervisor, Management) */}
        {!isRider && (
          <SideNavMenu renderIcon={Map} title="Operasional Spasial" defaultExpanded>
            <SideNavMenuItem
              as={NavLink}
              to="/map-ops"
              isActive={location.pathname === "/map-ops"}
              onClick={onCloseMobile}
            >
              Map Operations
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/zones"
              isActive={location.pathname === "/zones"}
              onClick={onCloseMobile}
            >
              Zone Geofence
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/distribution"
              isActive={location.pathname === "/distribution"}
              onClick={onCloseMobile}
            >
              FIFO Distribution
            </SideNavMenuItem>
          </SideNavMenu>
        )}

        {/* Intelligence Section (Superadmin, Management, Supervisor) */}
        {!isRider && (
          <SideNavMenu renderIcon={Calculator} title="Intelligence & DSS">
            <SideNavMenuItem
              as={NavLink}
              to="/dss"
              isActive={location.pathname.startsWith("/dss")}
              onClick={onCloseMobile}
            >
              DSS Engine (BWM)
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/pois"
              isActive={location.pathname === "/pois"}
              onClick={onCloseMobile}
            >
              POI Moderation
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/competitors"
              isActive={location.pathname === "/competitors"}
              onClick={onCloseMobile}
            >
              Competitor Survey
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/reports"
              isActive={location.pathname === "/reports"}
              onClick={onCloseMobile}
            >
              Analytics & Reports
            </SideNavMenuItem>
          </SideNavMenu>
        )}

        {/* Administration Section (Superadmin Only) */}
        {isSuperadmin && (
          <SideNavMenu renderIcon={Settings} title="Administrasi Sistem">
            <SideNavMenuItem
              as={NavLink}
              to="/fleet"
              isActive={location.pathname === "/fleet"}
              onClick={onCloseMobile}
            >
              Armada Telemetry
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/catalog"
              isActive={location.pathname === "/catalog"}
              onClick={onCloseMobile}
            >
              Product Catalog
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/users"
              isActive={location.pathname === "/users"}
              onClick={onCloseMobile}
            >
              User Directory (RBAC)
            </SideNavMenuItem>
            <SideNavMenuItem
              as={NavLink}
              to="/settings"
              isActive={location.pathname === "/settings"}
              onClick={onCloseMobile}
            >
              System Settings
            </SideNavMenuItem>
          </SideNavMenu>
        )}
      </SideNavItems>
    </SideNav>
  );
}
