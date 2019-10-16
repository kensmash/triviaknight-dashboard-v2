import React from "react";
import PropTypes from "prop-types";
import { Form, Transition, Dropdown } from "semantic-ui-react";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYGENRES from "../../../apollo/queries/categoryGenres";

const CatGenreSelect = props => {
  const { loading, error, data } = useQuery(QUERY_CATEGORYGENRES);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;
  let categoryGenres = data.categoryGenres.slice();

  if (props.categorytype !== null) {
    categoryGenres = categoryGenres.filter(genre =>
      genre.categorytypes.some(type => type._id === props.categorytype)
    );
  }
  const genres = categoryGenres.map(item => ({
    key: item._id,
    value: item._id,
    text: item.name
  }));

  return (
    <Transition
      visible={genres.length > 0}
      animation="slide down"
      duration={300}
    >
      <Form.Field>
        <label>Category Genres</label>
        <Dropdown
          placeholder={props.placeholder}
          value={props.value}
          fluid
          search
          selection
          multiple
          clearable
          onChange={props.catGenreSelectHandler}
          options={genres}
        />
      </Form.Field>
    </Transition>
  );
};

CatGenreSelect.propTypes = {
  value: PropTypes.array,
  placeholder: PropTypes.string.isRequired,
  categorytype: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  catGenreSelectHandler: PropTypes.func
};

export default CatGenreSelect;
