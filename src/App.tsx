import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import InventoryList from './pages/InventoryList';
import InventoryForm from './pages/InventoryForm';
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';
import SupplierList from './pages/SupplierList';
import SupplierForm from './pages/SupplierForm';
import MovementList from './pages/MovementList';
import MovementForm from './pages/MovementForm';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/items" replace />} />
        <Route path="/items" element={<Suspense fallback={null}><InventoryList /></Suspense>} />
        <Route path="/items/new" element={<Suspense fallback={null}><InventoryForm /></Suspense>} />
        <Route path="/items/:id/edit" element={<Suspense fallback={null}><InventoryForm /></Suspense>} />
        <Route path="/categories" element={<Suspense fallback={null}><CategoryList /></Suspense>} />
        <Route path="/categories/new" element={<Suspense fallback={null}><CategoryForm /></Suspense>} />
        <Route path="/categories/:id/edit" element={<Suspense fallback={null}><CategoryForm /></Suspense>} />
        <Route path="/suppliers" element={<Suspense fallback={null}><SupplierList /></Suspense>} />
        <Route path="/suppliers/new" element={<Suspense fallback={null}><SupplierForm /></Suspense>} />
        <Route path="/suppliers/:id/edit" element={<Suspense fallback={null}><SupplierForm /></Suspense>} />
        <Route path="/movements" element={<Suspense fallback={null}><MovementList /></Suspense>} />
        <Route path="/movements/new" element={<Suspense fallback={null}><MovementForm /></Suspense>} />
        <Route path="/movements/:id/edit" element={<Suspense fallback={null}><MovementForm /></Suspense>} />
        <Route path="/users" element={<Suspense fallback={null}><UserList /></Suspense>} />
        <Route path="/users/new" element={<Suspense fallback={null}><UserForm /></Suspense>} />
        <Route path="/users/:id/edit" element={<Suspense fallback={null}><UserForm /></Suspense>} />
      </Route>
    </Routes>
  );
}
