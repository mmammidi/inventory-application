import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import InventoryList from './pages/InventoryList';
import InventoryForm from './pages/InventoryForm';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/items" replace />} />
        <Route path="/items" element={<Suspense fallback={null}><InventoryList /></Suspense>} />
        <Route path="/items/new" element={<Suspense fallback={null}><InventoryForm /></Suspense>} />
        <Route path="/items/:id/edit" element={<Suspense fallback={null}><InventoryForm /></Suspense>} />
      </Route>
    </Routes>
  );
}
