import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Home, BookOpen, Utensils, Heart, Dumbbell, Palette, Music, Leaf, Plus, X } from "lucide-react";

interface TaskTemplate {
  title: string;
  description: string;
  reward: number;
  category: string;
}

interface TaskCategorySelectorProps {
  onTaskSelect: (task: TaskTemplate) => void;
  onCustomTask: (task: { title: string; description: string; reward: number }) => void;
}

const taskCategories = [
  {
    id: "household",
    name: "Household Chores",
    icon: Home,
    color: "bg-blue-100 text-blue-800",
    tasks: [
      { title: "Make the bed", description: "Tidy up your bed and arrange pillows", reward: 5, category: "household" },
      { title: "Clean your room", description: "Organize toys and clean surfaces", reward: 10, category: "household" },
      { title: "Set the table", description: "Help set up plates and utensils for meals", reward: 3, category: "household" },
      { title: "Clear the table", description: "Remove dishes and clean the table after meals", reward: 3, category: "household" },
      { title: "Take out the trash", description: "Empty trash bins and replace bags", reward: 5, category: "household" },
      { title: "Fold laundry", description: "Fold and organize clean clothes", reward: 8, category: "household" },
      { title: "Vacuum the floor", description: "Clean floors with the vacuum cleaner", reward: 7, category: "household" },
      { title: "Water the plants", description: "Give water to indoor and outdoor plants", reward: 4, category: "household" },
    ],
  },
  {
    id: "education",
    name: "Education & Learning",
    icon: BookOpen,
    color: "bg-green-100 text-green-800",
    tasks: [
      { title: "Complete homework", description: "Finish all assigned school work", reward: 15, category: "education" },
      { title: "Read for 20 minutes", description: "Read a book or educational material", reward: 8, category: "education" },
      { title: "Practice math", description: "Work on math problems or exercises", reward: 10, category: "education" },
      { title: "Study for test", description: "Review materials for upcoming exams", reward: 12, category: "education" },
      { title: "Write in journal", description: "Write about your day or creative story", reward: 6, category: "education" },
      { title: "Learn new word", description: "Learn and use 5 new vocabulary words", reward: 5, category: "education" },
      { title: "Practice handwriting", description: "Work on neat and clear writing", reward: 4, category: "education" },
      { title: "Research project", description: "Work on school research assignment", reward: 15, category: "education" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen & Cooking",
    icon: Utensils,
    color: "bg-orange-100 text-orange-800",
    tasks: [
      { title: "Help with cooking", description: "Assist in preparing meals", reward: 8, category: "kitchen" },
      { title: "Wash dishes", description: "Clean dishes and put them away", reward: 6, category: "kitchen" },
      { title: "Pack lunch", description: "Prepare your own lunch for school", reward: 5, category: "kitchen" },
      { title: "Set breakfast table", description: "Prepare table for morning meal", reward: 3, category: "kitchen" },
      { title: "Clean kitchen", description: "Wipe counters and organize kitchen", reward: 7, category: "kitchen" },
      { title: "Make snack", description: "Prepare healthy snack for yourself", reward: 4, category: "kitchen" },
      { title: "Grocery list", description: "Help write shopping list", reward: 3, category: "kitchen" },
      { title: "Organize pantry", description: "Sort and organize food items", reward: 6, category: "kitchen" },
    ],
  },
  {
    id: "health",
    name: "Health & Hygiene",
    icon: Heart,
    color: "bg-red-100 text-red-800",
    tasks: [
      { title: "Brush teeth", description: "Brush teeth morning and evening", reward: 3, category: "health" },
      { title: "Take shower", description: "Clean yourself thoroughly", reward: 4, category: "health" },
      { title: "Exercise 30 minutes", description: "Do physical activity or sports", reward: 10, category: "health" },
      { title: "Drink water", description: "Drink 8 glasses of water today", reward: 5, category: "health" },
      { title: "Eat vegetables", description: "Include vegetables in your meals", reward: 4, category: "health" },
      { title: "Get enough sleep", description: "Go to bed on time and rest well", reward: 6, category: "health" },
      { title: "Wash hands", description: "Keep hands clean throughout the day", reward: 2, category: "health" },
      { title: "Stretch exercises", description: "Do stretching and flexibility exercises", reward: 4, category: "health" },
    ],
  },
  {
    id: "fitness",
    name: "Sports & Fitness",
    icon: Dumbbell,
    color: "bg-purple-100 text-purple-800",
    tasks: [
      { title: "Go for a walk", description: "Take a 20-minute walk outside", reward: 6, category: "fitness" },
      { title: "Play sports", description: "Participate in team sports or games", reward: 8, category: "fitness" },
      { title: "Ride bicycle", description: "Go for a bike ride", reward: 7, category: "fitness" },
      { title: "Jump rope", description: "Jump rope for 10 minutes", reward: 5, category: "fitness" },
      { title: "Dance practice", description: "Practice dancing or movement", reward: 6, category: "fitness" },
      { title: "Swimming", description: "Go swimming or water activities", reward: 10, category: "fitness" },
      { title: "Yoga session", description: "Do yoga or stretching exercises", reward: 5, category: "fitness" },
      { title: "Outdoor games", description: "Play active games outside", reward: 7, category: "fitness" },
    ],
  },
  {
    id: "creative",
    name: "Creative Activities",
    icon: Palette,
    color: "bg-pink-100 text-pink-800",
    tasks: [
      { title: "Draw a picture", description: "Create artwork or drawing", reward: 6, category: "creative" },
      { title: "Write a story", description: "Write a creative story or poem", reward: 8, category: "creative" },
      { title: "Make crafts", description: "Create something with arts and crafts", reward: 7, category: "creative" },
      { title: "Build with blocks", description: "Create structures with building blocks", reward: 5, category: "creative" },
      { title: "Paint project", description: "Complete a painting or art project", reward: 8, category: "creative" },
      { title: "Learn instrument", description: "Practice playing a musical instrument", reward: 10, category: "creative" },
      { title: "Photography", description: "Take interesting photos", reward: 6, category: "creative" },
      { title: "DIY project", description: "Complete a do-it-yourself project", reward: 12, category: "creative" },
    ],
  },
  {
    id: "music",
    name: "Music & Entertainment",
    icon: Music,
    color: "bg-indigo-100 text-indigo-800",
    tasks: [
      { title: "Practice piano", description: "Practice piano for 20 minutes", reward: 8, category: "music" },
      { title: "Learn new song", description: "Learn to play or sing a new song", reward: 10, category: "music" },
      { title: "Listen to music", description: "Listen to different types of music", reward: 3, category: "music" },
      { title: "Create playlist", description: "Make a playlist of favorite songs", reward: 4, category: "music" },
      { title: "Dance to music", description: "Dance and move to music", reward: 5, category: "music" },
      { title: "Music theory", description: "Learn basic music theory concepts", reward: 8, category: "music" },
      { title: "Record music", description: "Record yourself playing or singing", reward: 6, category: "music" },
      { title: "Attend concert", description: "Go to a live music performance", reward: 15, category: "music" },
    ],
  },
  {
    id: "nature",
    name: "Nature & Outdoors",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-800",
    tasks: [
      { title: "Garden work", description: "Help in the garden or plant care", reward: 8, category: "nature" },
      { title: "Nature walk", description: "Take a walk and observe nature", reward: 6, category: "nature" },
      { title: "Bird watching", description: "Observe and identify birds", reward: 5, category: "nature" },
      { title: "Collect leaves", description: "Collect and identify different leaves", reward: 4, category: "nature" },
      { title: "Outdoor picnic", description: "Have a picnic in the park", reward: 7, category: "nature" },
      { title: "Plant seeds", description: "Plant and care for new plants", reward: 8, category: "nature" },
      { title: "Weather observation", description: "Observe and record weather patterns", reward: 3, category: "nature" },
      { title: "Nature photography", description: "Take photos of natural objects", reward: 6, category: "nature" },
    ],
  },
];

export default function TaskCategorySelector({ onTaskSelect, onCustomTask }: TaskCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCustomTask, setShowCustomTask] = useState(false);
  const [customTask, setCustomTask] = useState({ title: "", description: "", reward: 0 });

  const handleCustomTaskSubmit = () => {
    if (customTask.title && customTask.description && customTask.reward > 0) {
      onCustomTask(customTask);
      setCustomTask({ title: "", description: "", reward: 0 });
      setShowCustomTask(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Category Selection */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {taskCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory === category.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedCategory(category.id)}>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-3'>
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <IconComponent className='w-5 h-5' />
                  </div>
                  <CardTitle className='text-sm'>{category.name}</CardTitle>
                </div>
                <CardDescription className='text-xs'>{category.tasks.length} tasks available</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Custom Task Button */}
      <div className='flex justify-center'>
        <Button variant='outline' onClick={() => setShowCustomTask(!showCustomTask)} className='flex items-center gap-2'>
          <Plus className='w-4 h-4' />
          Create Custom Task
        </Button>
      </div>

      {/* Custom Task Form */}
      {showCustomTask && (
        <Card className='border-2 border-dashed'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              Custom Task
              <Button variant='ghost' size='sm' onClick={() => setShowCustomTask(false)}>
                <X className='w-4 h-4' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='custom-title'>Task Title</Label>
              <Input id='custom-title' value={customTask.title} onChange={e => setCustomTask({ ...customTask, title: e.target.value })} placeholder='Enter custom task title' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='custom-description'>Description</Label>
              <Input id='custom-description' value={customTask.description} onChange={e => setCustomTask({ ...customTask, description: e.target.value })} placeholder='Enter task description' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='custom-reward'>Reward (coins)</Label>
              <Input id='custom-reward' type='number' value={customTask.reward} onChange={e => setCustomTask({ ...customTask, reward: parseInt(e.target.value) || 0 })} placeholder='Enter reward amount' />
            </div>
            <Button onClick={handleCustomTaskSubmit} disabled={!customTask.title || !customTask.description || customTask.reward <= 0} className='w-full'>
              Create Custom Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Task Selection */}
      {selectedCategory && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{taskCategories.find(c => c.id === selectedCategory)?.name} Tasks</h3>
            <Button variant='ghost' size='sm' onClick={() => setSelectedCategory(null)}>
              <X className='w-4 h-4' />
            </Button>
          </div>

          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {taskCategories
              .find(c => c.id === selectedCategory)
              ?.tasks.map((task, index) => (
                <Card key={index} className='cursor-pointer hover:shadow-md transition-all'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-sm'>{task.title}</CardTitle>
                      <Badge variant='secondary'>{task.reward} coins</Badge>
                    </div>
                    <CardDescription className='text-xs'>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <Button size='sm' className='w-full' onClick={() => onTaskSelect(task)}>
                      Select This Task
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
