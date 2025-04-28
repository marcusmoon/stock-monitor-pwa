import React from 'react';
import StockList from './components/StockList';
import StockChart from './components/StockChart';
import NewsList from './components/NewsList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Monitor</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StockList />
              <StockChart />
            </div>
            <div className="mt-6">
              <NewsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 