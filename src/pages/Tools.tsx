import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Download, FileText, Activity, FileType } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';

export const Tools: React.FC = () => {
  const { user, profile } = useAppContext();
  const t = useTranslation(profile?.language);
  
  const [weight, setWeight] = useState(profile?.weightGoal?.toString() || '');
  const [height, setHeight] = useState('170');
  const [bmi, setBmi] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFormat, setReportFormat] = useState<'txt' | 'pdf'>('txt');

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    if (w > 0 && h > 0) {
      setBmi(w / (h * h));
    }
  };

  const generateReport = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      // Fetch last 30 days of records
      const recordsRef = collection(db, `users/${user.uid}/daily_records`);
      const qRecords = query(recordsRef, orderBy('date', 'desc'), limit(30));
      const snapshotRecords = await getDocs(qRecords);

      // Fetch last 30 days of workouts
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      const workoutsRef = collection(db, `users/${user.uid}/workouts`);
      const qWorkouts = query(workoutsRef, where('date', '>=', thirtyDaysAgoStr), orderBy('date', 'desc'));
      const snapshotWorkouts = await getDocs(qWorkouts);
      
      let reportContent = `DIETARYO - 30 Day Summary Report\n`;
      reportContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
      reportContent += `----------------------------------------\n\n`;
      
      let totalWater = 0;
      let daysWithFasting = 0;
      let totalWorkoutMins = 0;
      let totalWorkouts = snapshotWorkouts.size;

      snapshotWorkouts.docs.forEach(doc => {
        totalWorkoutMins += doc.data().duration || 0;
      });

      if (snapshotRecords.empty && snapshotWorkouts.empty) {
        reportContent += `No data found for the last 30 days.\n`;
      } else {
        snapshotRecords.docs.forEach(doc => {
          const data = doc.data();
          reportContent += `Date: ${data.date}\n`;
          reportContent += `- Water Intake: ${data.waterIntake || 0} ml\n`;
          if (data.fastingStart) {
            reportContent += `- Fasting: Logged\n`;
            daysWithFasting++;
          }
          
          // Find workouts for this date
          const dailyWorkouts = snapshotWorkouts.docs.filter(w => w.data().date === data.date);
          if (dailyWorkouts.length > 0) {
            reportContent += `- Workouts: ${dailyWorkouts.length} session(s)\n`;
            dailyWorkouts.forEach(w => {
              const wData = w.data();
              reportContent += `  * ${wData.type} - ${wData.duration} mins (${wData.intensity})\n`;
            });
          }

          totalWater += (data.waterIntake || 0);
          reportContent += `\n`;
        });
        
        reportContent += `----------------------------------------\n`;
        reportContent += `Summary:\n`;
        reportContent += `- Total Days Logged: ${snapshotRecords.size}\n`;
        reportContent += `- Average Water Intake: ${snapshotRecords.size > 0 ? Math.round(totalWater / snapshotRecords.size) : 0} ml/day\n`;
        reportContent += `- Days with Fasting: ${daysWithFasting}\n`;
        reportContent += `- Total Workouts: ${totalWorkouts}\n`;
        reportContent += `- Total Workout Time: ${totalWorkoutMins} mins\n`;
      }

      if (reportFormat === 'txt') {
        // Create blob and download TXT
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dietaryo_Report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (reportFormat === 'pdf') {
        // Generate PDF
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('DIETARYO - 30 Day Summary Report', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        let yPos = 45;
        
        if (snapshotRecords.empty && snapshotWorkouts.empty) {
          doc.text('No data found for the last 30 days.', 20, yPos);
        } else {
          doc.setFontSize(14);
          doc.text('Summary', 20, yPos);
          yPos += 10;
          
          doc.setFontSize(12);
          doc.text(`Total Days Logged: ${snapshotRecords.size}`, 20, yPos);
          yPos += 8;
          doc.text(`Average Water Intake: ${snapshotRecords.size > 0 ? Math.round(totalWater / snapshotRecords.size) : 0} ml/day`, 20, yPos);
          yPos += 8;
          doc.text(`Days with Fasting: ${daysWithFasting}`, 20, yPos);
          yPos += 8;
          doc.text(`Total Workouts: ${totalWorkouts}`, 20, yPos);
          yPos += 8;
          doc.text(`Total Workout Time: ${totalWorkoutMins} mins`, 20, yPos);
          yPos += 15;
          
          doc.setFontSize(14);
          doc.text('Daily Breakdown', 20, yPos);
          yPos += 10;
          
          doc.setFontSize(10);
          snapshotRecords.docs.forEach(docSnap => {
            const data = docSnap.data();
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text(`Date: ${data.date}`, 20, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 6;
            
            doc.text(`- Water Intake: ${data.waterIntake || 0} ml`, 25, yPos);
            yPos += 6;
            
            if (data.fastingStart) {
              doc.text(`- Fasting: Logged`, 25, yPos);
              yPos += 6;
            }

            const dailyWorkouts = snapshotWorkouts.docs.filter(w => w.data().date === data.date);
            if (dailyWorkouts.length > 0) {
              doc.text(`- Workouts: ${dailyWorkouts.length} session(s)`, 25, yPos);
              yPos += 6;
              dailyWorkouts.forEach(w => {
                const wData = w.data();
                doc.text(`  * ${wData.type} - ${wData.duration} mins (${wData.intensity})`, 25, yPos);
                yPos += 6;
              });
            }
            
            yPos += 4; // Spacing between days
          });
        }
        
        doc.save(`Dietaryo_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4 h-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('tools')}</h2>
          <p className="text-sm opacity-60">{t('toolsSubtitle')}</p>
        </div>
      </div>

      {/* BMI Calculator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-3xl flex flex-col gap-4"
      >
        <h3 className="font-medium flex items-center gap-2">
          <Calculator className="w-5 h-5 opacity-50" />
          {t('bmiCalculator')}
        </h3>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs opacity-70 mb-1 block">{t('weight')}</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 bg-black/5 rounded-xl border-none outline-none font-medium"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs opacity-70 mb-1 block">{t('height')}</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-3 bg-black/5 rounded-xl border-none outline-none font-medium"
            />
          </div>
        </div>
        
        <button 
          onClick={calculateBMI}
          className="w-full py-3 bg-[var(--primary-btn)] text-[var(--primary-btn-text)] rounded-xl font-medium transition-transform active:scale-95"
        >
          {t('calculate')}
        </button>

        <AnimatePresence>
          {bmi !== null && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-4 bg-black/5 rounded-xl text-center"
            >
              <div className="text-sm opacity-70">{t('yourBmi')}</div>
              <div className="text-3xl font-bold mt-1">{bmi.toFixed(1)}</div>
              <div className="text-xs font-medium mt-2 px-3 py-1 bg-black/10 rounded-full inline-block">
                {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Report Generator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-3xl flex flex-col gap-4"
      >
        <h3 className="font-medium flex items-center gap-2">
          <FileText className="w-5 h-5 opacity-50" />
          {t('thirtyDayReport')}
        </h3>
        <p className="text-sm opacity-70">
          {t('reportDescription')}
        </p>
        
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setReportFormat('txt')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              reportFormat === 'txt' 
                ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' 
                : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <FileType className="w-4 h-4" />
            TXT
          </button>
          <button
            onClick={() => setReportFormat('pdf')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              reportFormat === 'pdf' 
                ? 'bg-[var(--primary-btn)] text-[var(--primary-btn-text)]' 
                : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>

        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full py-4 bg-black/5 hover:bg-black/10 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Activity className="w-5 h-5" />
            </motion.div>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {t('downloadReport')}
        </button>
      </motion.div>
    </div>
  );
};
