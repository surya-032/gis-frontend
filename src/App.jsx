import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardLayout from "./components/Dashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardAdmin from "./pages/dashboards/DashboardAdmin";
import PetaDashboard from "./pages/dashboards/PetaDashboard";

import PreviewMarker from "./pages/dashboards/markers/PreviewMarker";
import AddMarker from "./pages/dashboards/markers/AddMarker";
import EditMarker from "./pages/dashboards/markers/EditMarker";
import ManageMarker from "./pages/dashboards/markers/EditManageMarker"; 
import DeleteMarker from "./pages/dashboards/markers/DeleteMarker";

import PreviewLine from "./pages/dashboards/lines/PreviewLine";
import AddLine from "./pages/dashboards/lines/AddLine";
import EditManageLine from "./pages/dashboards/lines/EditManageLine";
import EditLine from "./pages/dashboards/lines/EditLine";
import DeleteLine from "./pages/dashboards/lines/DeleteLine";

import PreviewPolygon from "./pages/dashboards/polygons/PreviewPolygon";
import AddPolygon from "./pages/dashboards/polygons/AddPolygon";
import EditPolygon from "./pages/dashboards/polygons/EditPolygon";
import EditManagePolygon from "./pages/dashboards/polygons/EditManagePolygon";
import DeletePolygon from "./pages/dashboards/polygons/DeletePolygon";

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Proteksi dashboard dengan token */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardAdmin />} /> 
            <Route path="admin" element={<DashboardAdmin />} />
            <Route path="map" element={<PetaDashboard />} />

            {/* Manajemen Marker */}
            <Route path="marker/preview" element={<PreviewMarker />} /> 
            <Route path="marker/add" element={<AddMarker />} />
            <Route path="marker/manage" element={<ManageMarker />} />
            <Route path="marker/edit/:id" element={<EditMarker />} />
            <Route path="marker/delete" element={<DeleteMarker />} />
            <Route path="marker/delete/:id" element={<DeleteMarker />} /> 

             {/* Manajemen Line/Route */}
            <Route path="line/preview" element={<PreviewLine />} />
            <Route path="line/add" element={<AddLine />} />
            <Route path="line/manage" element={<EditManageLine />} /> 
            <Route path="line/edit/:id" element={<EditLine />} />
            <Route path="line/delete/" element={<DeleteLine />} /> 
            <Route path="line/delete/:id" element={<DeleteLine />} /> 

            <Route path="polygon/preview" element={<PreviewPolygon />} />
            <Route path="polygon/add" element={<AddPolygon />} />
            <Route path="polygon/manage" element={<EditManagePolygon />} />
            <Route path="polygon/edit/:id" element={<EditPolygon />} />
            <Route path="polygon/delete" element={<DeletePolygon />} />
            <Route path="polygon/delete/:id" element={<DeletePolygon />} />
            
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
