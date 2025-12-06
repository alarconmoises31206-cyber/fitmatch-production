import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  experience: number;
  location: string;
  hourlyRate: number;
  scores: {
    goal?: number;
    style?: number;
    personality?: number;
    approach?: number;
    technical?: number;
  };
  specialties: string[];
  certifications: string[];
}

export default function TrainerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadTrainer() {
      try {
        // Mock data - replace with actual API call later
        const mockTrainer: Trainer = {
          id: id as string,
          name: 'Alex Johnson',
          specialty: 'Strength Training',
          bio: 'Certified personal trainer with 5 years of experience helping clients achieve their fitness goals through customized strength training programs.',
          experience: 5,
          location: 'New York, NY',
          hourlyRate: 75,
          scores: {
            goal: 85,
            style: 90,
            personality: 80,
            approach: 75,
            technical: 88
          },
          specialties: ['Strength Training', 'Bodybuilding', 'Powerlifting'],
          certifications: ['NASM Certified', 'CPR/AED Certified']
        };
        
        setTrainer(mockTrainer);
      } catch (error) {
        console.error('Error loading trainer:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrainer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading trainer profile...</div>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Trainer not found</div>
        </div>
      </div>
    );
  }

  // Safe score data with fallbacks
  const scoreData = [
    { 
      name: 'Goal Alignment', 
      value: trainer.scores?.goal || 0, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Training Style', 
      value: trainer.scores?.style || 0, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Personality Fit', 
      value: trainer.scores?.personality || 0, 
      color: 'bg-purple-500' 
    },
    { 
      name: 'Approach Match', 
      value: trainer.scores?.approach || 0, 
      color: 'bg-orange-500' 
    },
    { 
      name: 'Technical Skills', 
      value: trainer.scores?.technical || 0, 
      color: 'bg-red-500' 
    },
  ];

  const averageScore = Math.round(
    scoreData.reduce((sum, item) => sum + item.value, 0) / scoreData.length
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-2xl">
                  {trainer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{trainer.name}</h1>
                  <p className="text-lg text-gray-600">{trainer.specialty}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {averageScore}% Match
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{trainer.bio}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Experience:</span>
                  <br />
                  {trainer.experience} years
                </div>
                <div>
                  <span className="font-semibold">Location:</span>
                  <br />
                  {trainer.location}
                </div>
                <div>
                  <span className="font-semibold">Rate:</span>
                  <br />
                  ${trainer.hourlyRate}/hour
                </div>
                <div>
                  <span className="font-semibold">Specialties:</span>
                  <br />
                  {trainer.specialties.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Compatibility Scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Compatibility Scores</h2>
            <div className="space-y-4">
              {scoreData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties & Certifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <ul className="space-y-2">
                {trainer.certifications.map((cert, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold">
            Book Session
          </button>
          <button className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition font-semibold">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}