import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useJsApiLoader, Autocomplete, Libraries } from '@react-google-maps/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  employmentStatus: string;
  annualIncome: string;
  idType: string;
  idNumber: string;
  idState: string;
  idExpiration: string;
  mailingAddress?: string;
  alternateAddress?: string;
  idFront?: File;
  idBack?: File;
}
const GOOGLE_MAPS_API_KEY = 'AIzaSyCunQDSJjgKXvKt1avuUe3BIGEjbZM7mkg'; // Replace with your key

const libraries: Libraries = ['places'];

const OpenAccountPage: React.FC = () => {
  console.log('Rendering OpenAccountPage...');
  const navigate = useNavigate(); // Ensure this is inside the component
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    employmentStatus: '',
    annualIncome: '',
    idType: '',
    idNumber: '',
    idState: '',
    idExpiration: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== undefined) {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        setAccountNumber(data.accountNumber);
        setTimeout(() => {
          setLoading(false);
          setSuccess(true);
        }, 10000); // 10 seconds delay
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const onLoad = (auto: google.maps.places.Autocomplete) => setAutocomplete(auto);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      setFormData(prev => ({
        ...prev,
        address: place.formatted_address || '',
      }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name*
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name*
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number*
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth*
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>
      <div>
        <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-1">
          Social Security Number*
        </label>
        <input
          type="text"
          id="ssn"
          name="ssn"
          value={formData.ssn}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address*
        </label>
        {isLoaded ? (
          <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
              required
            />
          </Autocomplete>
        ) : (
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City*
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State*
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select State</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code*
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
          Employment Status*
        </label>
        <select
          id="employmentStatus"
          name="employmentStatus"
          value={formData.employmentStatus}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        >
          <option value="">Select Status</option>
          <option value="employed">Employed</option>
          <option value="self-employed">Self-Employed</option>
          <option value="unemployed">Unemployed</option>
        </select>
      </div>
      <div>
        <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-1">
          Annual Income*
        </label>
        <input
          type="number"
          id="annualIncome"
          name="annualIncome"
          value={formData.annualIncome}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">
            ID Type*
          </label>
          <select
            id="idType"
            name="idType"
            value={formData.idType}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select ID Type</option>
            <option value="drivers-license">Driver's License</option>
            <option value="state-id">State ID</option>
            <option value="passport">Passport</option>
          </select>
        </div>
        <div>
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
            ID Number*
          </label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="idState" className="block text-sm font-medium text-gray-700 mb-1">
          ID State*
        </label>
        <select
          id="idState"
          name="idState"
          value={formData.idState}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        >
         <option value="">Select State</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
        </select>
      </div>
      <div>
        <label htmlFor="idExpiration" className="block text-sm font-medium text-gray-700 mb-1">
          ID Expiration Date*
        </label>
        <input
          type="date"
          id="idExpiration"
          name="idExpiration"
          value={formData.idExpiration}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>
      <div>
        <label htmlFor="idFront" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Front of ID*
        </label>
        <input
          type="file"
          id="idFront"
          name="idFront"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>
      <div>
        <label htmlFor="idBack" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Back of ID*
        </label>
        <input
          type="file"
          id="idBack"
          name="idBack"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>
    </div>
  );

  const handleNavigation = () => {
    console.log('Navigating to dashboard...');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-blue-800">Please wait while we check your application...</h1>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-green-600">Congratulations!</h1>
          <p className="mt-4">Your checking account has been opened successfully.</p>
          <p className="mt-2">Here is your account number:</p>
          <p className="text-xl font-bold text-blue-800 mt-2">{accountNumber}</p>
          <button
            onClick={() => navigate('/enroll')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Enroll in Online Banking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                className="text-blue-800 hover:text-red-600 mr-4"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">Free Checking Account Application</h1>
                <p className="text-gray-600">Please complete all required fields marked with an asterisk (*)</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 text-red-600 bg-red-100 border border-red-200 rounded p-3">
                  {error}
                </div>
              )}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              <div className="mt-8 flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="ml-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </form>
            <div className="mt-8 flex items-start space-x-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
              <Shield size={20} className="text-blue-800 flex-shrink-0" />
              <p>
                Your security is important to us. We use industry-standard encryption to protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OpenAccountPage;