import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ConfirmEmail from './pages/Auth/ConfirmEmail'
import ForgotPasswordEmail from './pages/Auth/ForgotPasswordEmail'
import ForgotPasswordReset from './pages/Auth/ForgotPasswordReset'
import DashboardLayout from './pages/Dashboard.Layout'
import Files from './pages/Files/AllFiles/Files'
import UploadFiles from './pages/Files/fileDetails/fileDetails'
import LoginProtector from './protectors/LoginProtector'
import Profile from './pages/profile/Profile'
import RoleProtector from './protectors/RoleProtector'
import Users from './pages/OwnerPages/Users/Users'
import Analasys from './pages/OwnerPages/Analasyis/Analasys'
import { useCookies } from 'react-cookie'
import { jwtDecode } from 'jwt-decode'
import LandingLayout from './pages/LandingLayout'

import VedioPreview from './pages/VedioPreview/VedioPreview'
import Earning from './pages/Earning/Earning'
import Promoters from './pages/OwnerPages/Promoters/Promoters'
import PromotersEarning from './pages/Earning/PromotersEarning'
import Notifications from './pages/Notifications/Notifications'
import PromoterDashboard from './pages/Promoter/PromoterDashboard'
import SharedFiles from './pages/SharedFiles/SharedFiles'
import RevenueData from './pages/RevenueData/RevenueData'
import Referral from './pages/Referral/Referral'
import PromoterProtector from './protectors/PromoterProtector'
import PromoterWithPlanProtector from './protectors/PromoterWithPlanProtector'


// Main Pages
const Feedback = lazy(() => import('./pages/Feedback/Feedback'))
const PrivacyPolicy = lazy(() => import('./pages/Privacy/Privacy'))
const RemovalGuidelines = lazy(() => import('./pages/RemovalPolicy/RemovalPolicy'))
const Partners = lazy(() => import('./pages/Subscription/Subscription'))

import Loading from './components/Loading/Loading'
import SignupForMoney from './pages/Auth/SignupForMoney'
import Reports from './pages/OwnerPages/Reports/Reports'


const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [Token] = useCookies(['MegaBox']);


  return children({ navigate, auth, Token });
};


const router = createBrowserRouter(

  [
    {
      path: "/",
      element: <LandingLayout />,
      children: [
        {
          index: true, element: <LandingPage />
        },
        {
          path: "Partners", element:
            <Suspense fallback={<Loading />}><Partners /></Suspense>
        },
        {
          path: "Privacy", element: <Suspense fallback={<Loading />}> <PrivacyPolicy /></Suspense>
        },
        {
          path: "Privacy-Removal", element: <Suspense fallback={<Loading />}>
            <RemovalGuidelines />
          </Suspense>
        },
        {
          path: "copyright-feedback", element: <Suspense fallback={<Loading />}> <Feedback /></Suspense>
        }
      ]
    }, {
      path: "share/:VedioId", element: <VedioPreview />
    },
    {
      path: "/login",
      element: (
        <AuthWrapper>
          {({ navigate, auth, Token }) => (
            <Login
              onSignup={() => navigate('/signup')}
              onForgot={() => navigate('/forgot-password')}

              onSubmit={async (values) => {
                let success = await auth.login(values.email, values.password)

                const tokenStr = Token.MegaBox;
                console.log(tokenStr);


                if (success) {
                  const { role } = jwtDecode(success);
                  console.log(role);
                  switch (role) {
                    case 'User':
                      navigate('/dashboard');
                      break;
                    case 'Owner':
                      navigate('/Owner/profile');
                      break;
                    case 'Advertiser':
                      navigate('/Advertiser');
                      break;
                    default:
                      navigate('/dashboard');
                  }
                }

              }}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/signup",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <Signup
              onLogin={() => navigate('/login')}
              onConfirmMail={async (values) => {
                const success = await auth.signup(
                  values.username,
                  values.email,
                  values.password,
                  values.confirmationPassword
                );
                if (success) {
                  navigate('/confirm-email');
                }
              }}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/register",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => {
            const location = window.location;
            const params = new URLSearchParams(location.search);
            const ref = params.get("ref");

            return (
              <SignupForMoney
                refCode={ref}
                onLogin={() => navigate('/login')}
                onConfirmMail={async (values) => {
                  const success = await auth.signupWithRef(
                    values.username,
                    values.email,
                    values.password,
                    values.confirmationPassword,
                    ref
                  );
                  console.log(success);

                  if (success) {
                    navigate('/confirm-email');
                  }
                }}
                loading={auth.loading}
                error={auth.error}
              />
            );
          }}
        </AuthWrapper>
      )
    },
    {
      path: "/confirm-email",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <ConfirmEmail
              email={auth.tempEmail}
              onConfirm={async (code) => {
                const success = await auth.confirmOTP(code, auth.tempEmail);
                if (success) {
                  navigate('/login');
                }
              }}
              onResend={async () => {

              }}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/forgot-password",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <ForgotPasswordEmail
              onSendCode={async (email) => {
                const success = await auth.forgotPassword(email);
                if (success) {
                  navigate('/reset-password');
                }
              }}
              onBackToLogin={() => navigate('/login')}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/reset-password",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <ForgotPasswordReset
              onReset={async (values) => {
                const success = await auth.resetPassword(
                  values.email,
                  values.password,
                  values.code
                );
                if (success) {
                  navigate('/login');
                }
              }}
              onBackToLogin={() => navigate('/login')}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },

    // User dash /////////////////////////////
    {
      path: "/dashboard", element: <LoginProtector><DashboardLayout role={"User"} /> </LoginProtector>, children: [
        {
          index: true, element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Files />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "file/:fileName/:fileId", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <UploadFiles />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Profile />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "Earnings", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <PromoterWithPlanProtector>
                  <Earning />
                </PromoterWithPlanProtector>
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "notifications", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Notifications />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "shared-files", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <PromoterWithPlanProtector>
                  <SharedFiles />
                </PromoterWithPlanProtector>
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "revenue-data", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <PromoterWithPlanProtector>
                  <RevenueData />
                </PromoterWithPlanProtector>
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "referral", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Referral />
              </RoleProtector>
            </LoginProtector>
        }
      ]
    },
    // User dash

    // Promoter /////////////////////////////
    {
      path: "/Promoter", element: <LoginProtector><DashboardLayout role={"User"} /> </LoginProtector>, children: [
        {
          index: true, element:
            <LoginProtector>
              <PromoterProtector>
                <PromoterDashboard />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "notifications", element:
            <LoginProtector>
              <PromoterProtector>
                <Notifications />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <PromoterProtector>
                <Profile />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "files", element:
            <LoginProtector>
              <PromoterProtector>
                <Files />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "file/:fileName/:fileId", element:
            <LoginProtector>
              <PromoterProtector>
                <UploadFiles />
              </PromoterProtector>
            </LoginProtector>
        }
      ]
    },
    // Promoter 

    // Owner ////////////////////////////
    {
      path: "/Owner", element: <LoginProtector><DashboardLayout role={"Owner"} /> </LoginProtector>, children: [
        {
          index: true, element:
            <LoginProtector>
              <RoleProtector requiredRole="Owner">
                <Analasys />
              </RoleProtector >
            </LoginProtector>
        },
        {
          path: "Users", element:
            <RoleProtector requiredRole="Owner">
              <LoginProtector>
                <Users />
              </LoginProtector>
            </RoleProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <RoleProtector requiredRole="Owner">
                <Profile />
              </RoleProtector>
            </LoginProtector>
        }, {
          path: "AllPromoters", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Promoters />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Promoter/:id", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <PromotersEarning />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Reports", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Reports />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "notifications", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Notifications />
            </RoleProtector>
          </LoginProtector>
        }
      ]
    },

    // Advertiser /////////////
    {
      path: "/Advertiser", element: <LoginProtector><DashboardLayout role={"Advertiser"} /> </LoginProtector>, children: [
        {
          index: true, element:
            <LoginProtector>
              <RoleProtector requiredRole="Advertiser">
                <Files />
              </RoleProtector >
            </LoginProtector>
        },
        {
          path: "file/:fileName/:fileId", element:
            <RoleProtector requiredRole="Advertiser">
              <LoginProtector>
                <UploadFiles />
              </LoginProtector>
            </RoleProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <RoleProtector requiredRole="Advertiser">
                <Profile />
              </RoleProtector>
            </LoginProtector>
        }
      ]
    }
    // Owner 

  ]
)

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App
