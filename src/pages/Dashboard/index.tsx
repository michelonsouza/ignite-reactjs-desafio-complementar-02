import { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food, {FoodType} from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

export function Dashboard(): JSX.Element {
  const [foods, setFoods] = useState<FoodType[]>([]);
  const [editingFood, setEditingFood] = useState<FoodType>({} as FoodType);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const {data} = await api.get<FoodType[]>('/foods');

      setFoods(data);
    }

    loadData();
  }, []);

  const handleAddFood = useCallback(async (food: FoodType) => {
    try {
      const {data} = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods(oldState => [...oldState, data]);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleUpdateFood = useCallback(async (food: FoodType) => {
    try {
      const {data} = await api.put<FoodType>(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== data.id ? f : data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }, [editingFood, foods]);

  const handleDeleteFood = useCallback(async (id: number) => {
    await api.delete(`/foods/${id}`);

    setFoods(oldState => oldState.filter(food => food.id !== id));
  }, []);

  const toggleModal = useCallback(() => {
    setModalOpen(oldState => !oldState);
  }, []);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(oldState => !oldState);
  }, []);

  const handleEditFood = useCallback((food: FoodType) => {
    setEditingFood(food);
    setEditModalOpen(true);
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}

export default Dashboard;
