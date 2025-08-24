import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
import { examineCurrentSchema, testConnection, getUserSample, getStorySample } from '@/utils/safeMigration';

const DatabaseExaminer: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>('');

  const runSafeExamination = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      setStep('Testing connection...');
      const connectionTest = await testConnection();
      
      if (!connectionTest.success) {
        setResults({ error: 'Connection failed', details: connectionTest.error });
        setLoading(false);
        return;
      }
      
      setStep('Examining database schema...');
      const schemaInfo = await examineCurrentSchema();
      
      setStep('Getting user sample...');
      const userSample = await getUserSample(3);
      
      setStep('Getting story sample...');
      const storySample = await getStorySample(3);
      
      setStep('Analysis complete!');
      
      setResults({
        connection: connectionTest,
        schema: schemaInfo,
        userSample,
        storySample,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Examination error:', error);
      setResults({ error: 'Examination failed', details: error });
    }
    
    setLoading(false);
    setStep('');
  };

  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 m-4">
      <h2 className="text-2xl font-bold text-white mb-4">🔍 Safe Database Examination</h2>
      <p className="text-white/70 mb-6">
        This tool safely examines your current database structure without making any changes.
        It will help us understand your existing data before planning the migration.
      </p>
      
      <div className="mb-6">
        <Button
          onClick={runSafeExamination}
          disabled={loading}
          className="fantasy-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Examining...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>Examine Database</span>
            </>
          )}
        </Button>
        
        {loading && step && (
          <p className="text-amber-400 mt-2 text-sm">
            {step}
          </p>
        )}
      </div>
      
      {results && (
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-bold mb-2">📊 Examination Results:</h3>
          <pre className="text-white/80 text-xs whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      {results?.error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mt-4">
          <h3 className="text-red-400 font-bold">❌ Error:</h3>
          <p className="text-red-300">{results.error}</p>
          {results.details && (
            <pre className="text-red-200 text-xs mt-2 overflow-x-auto">
              {JSON.stringify(results.details, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      {results?.schema && (
        <div className="mt-6 space-y-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 font-bold">✅ Found Tables:</h3>
            <ul className="text-green-300 text-sm mt-2">
              {results.schema.existingTables?.map((table: any, index: number) => (
                <li key={index}>
                  📋 {table.name}: {table.recordCount} records
                </li>
              ))}
            </ul>
          </div>
          
          {results.schema.userInfo && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-bold">👥 Users Found:</h3>
              <p className="text-blue-300">
                {results.schema.totalUsers} users in database
              </p>
              <p className="text-blue-200 text-sm">
                Columns: {results.schema.userInfo.sampleColumns?.join(', ')}
              </p>
            </div>
          )}
          
          {results.schema.storyInfo && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-purple-400 font-bold">📚 Stories Found:</h3>
              <p className="text-purple-300">
                {results.schema.totalStories} stories in {results.schema.storyInfo.tableName}
              </p>
              <p className="text-purple-200 text-sm">
                Columns: {results.schema.storyInfo.sampleColumns?.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseExaminer;