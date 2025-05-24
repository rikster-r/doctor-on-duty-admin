import DepartmentsDashboard from '@/components/DepartmentsDashboard';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const authToken = context.req.cookies.authToken;

  if (!authToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};

function Departments() {
  return <DepartmentsDashboard />;
}

export default Departments;
